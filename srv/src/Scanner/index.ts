import { readdir, stat, readFile } from 'fs/promises';
import { createHash } from 'crypto';
import NodeID3 from 'node-id3';
import musicDuration from 'get-audio-duration';
import { StorageType } from '../Storage';
import { sleep } from '../utils';
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger/types';
import { Chain, ScannedItem } from './types';
import { Classificator } from '../Classificator';

export class Scanner {
  SLEEP_AFTER_SCAN = true;
  SLEEP_AFTER_SCAN_MS = 1;

  scanInProgress = false;

  constructor(private db: StorageType, private logger: Logger, private classificator: Classificator) {}

  getFsItem(filehash: string) {
    return this.db.fSItem.findFirst({ where: { filehash } });
  }

  /**
   * Создает связный список fsItem; Воссоздаёт структуру файловой системы
   */
  async getChain(): Promise<Chain> {
    const chain: Chain = {};
    const items = await this.db.fSItem.findMany();

    for (let item of items) {
      const chunks = item.path.split('/').filter(i => i !== '');
      const path: string[] = chunks.slice(0, chunks.length - 1);
      const filename: string = chunks.at(-1) || 'nulled';
      const pathIndexed = path.map((c, i) => `${i}-${c}`);
      const fileIndexed = `${pathIndexed.join('-')}-${filename}`;

      chain[fileIndexed] = {
        type: 'file',
        key: fileIndexed,
        parent: pathIndexed.at(-1) || null,
        name: filename,
        isClassified: (await this.classificator.getItem(item.filehash)).length !== 0,
        fsItem: item,
      };

      pathIndexed.forEach((chunk, index) => {
        if (chain[chunk] !== undefined) {
          return;
        }

        chain[chunk] = {
          type: 'dir',
          key: chunk,
          name: path[index],
          parent: index > 0 ? pathIndexed[index - 1] : null,
        }
      });
    }
    return chain;
  }

  /**
   * Синхронизирует файлы с БД (создаёт или обновляет). Не проверяет, существует ли файл из БД непосредственно в ФС
   * @param dir путь до директории с музыкой
   * @param filter фильтр-функция (чтобы на выходе были только .mp3, например)
   */
  async syncStorage(dir: string, filter: (item: ScannedItem) => boolean): Promise<void> {
    if (this.scanInProgress) {
      throw new Error('Scan already in progress!');
    }

    this.scanInProgress = true;
    const scannedItems = (await this.scan(dir, filter)).filter(i => i.isFile);

    for (let index in scannedItems) {
      const scannedItem = scannedItems[index];
      const startTime = Date.now();

      try {
        const hashSum = createHash('sha256');
        hashSum.update(await readFile(scannedItem.path));
        scannedItem.hash = hashSum.digest('hex');

        const tags = await NodeID3.Promise.read(scannedItem.path);
        scannedItem.id3 = {
          artist: tags.artist || '_unknown',
          title: tags.title || '_unnamed',
        };

        try {
          scannedItem.duration = await musicDuration(scannedItem.path);
        } catch {
          scannedItem.duration = 0;
        }

        const time = Date.now() - startTime;
        this.logger.log({ message: `Scan meta (took ${time}ms) for ${index}/${scannedItems.length} for file "${scannedItem.name}"`, tags: [LogTags.SCANNER], level: LogLevel.DEBUG });
      } catch (e) {
        this.logger.log({ message: `Scan meta failed for file "${scannedItem.name}" cause "${(e as Error).message}"`, tags: [LogTags.SCANNER], level: LogLevel.ERROR });
        continue;
      }

      try {
        const item = await this.db.fSItem.findFirst({ where: { filehash: scannedItem.hash } });

        if (item) {
          await this.logger.log({
            message: `Update record for '${scannedItem.name}' [${scannedItem.hash}]`,
            tags: [LogTags.SCANNER],
            level: LogLevel.INFO
          });

          await this.db.fSItem.update({
            data: {
              name: scannedItem.name,
              path: scannedItem.path,
              id3Artist: scannedItem.id3?.artist || 'nulled',
              id3Title: scannedItem.id3?.title || 'nulled',
              duration: scannedItem.duration || 0,
            },
            where: {
              filehash: scannedItem.hash
            },
          });
        } else {
          await this.logger.log({
            message: `Create record for '${scannedItem.name}' [${scannedItem.hash}]`,
            tags: [LogTags.SCANNER],
            level: LogLevel.INFO
          });

          await this.db.fSItem.create({
            data: {
              filehash: scannedItem.hash || 'nulled',
              name: scannedItem.name,
              path: scannedItem.path,
              type: 'file',
              id3Artist: scannedItem.id3?.artist || 'nulled',
              id3Title: scannedItem.id3?.title || 'nulled',
              duration: scannedItem.duration || 0,
            }
          });
        }
      } catch (e) {
        await this.logger.log({
          message: `Failed process record for '${scannedItem.name}' [${scannedItem.hash}]`,
          tags: [LogTags.SCANNER],
          level: LogLevel.ERROR
        });
      }
    }

    this.scanInProgress = false;
  }

  /**
   * Рекурсивная функция сканирования ФС
   */
  private async scan(dir: string, filter: (item: ScannedItem) => boolean): Promise<ScannedItem[]> {
    await this.logger.log({ message: `Scan '${dir}'`, tags: [LogTags.SCANNER], level: LogLevel.DEBUG });

    let content: ScannedItem[] = [];

    try {
      const dirContent = await this.getDirContent(dir);

      await this.logger.log({
        message: `Scanned '${dir}', found ${dirContent.length} entries`,
        tags: [LogTags.SCANNER],
        level: LogLevel.DEBUG
      });

      for (const item of dirContent) {
        if (!item.isDir) {
          if (filter(item)) {
            content.push(item);
          }

          continue;
        }

        const next = await this.scan(item.path, filter);
        next.forEach((i) => content.push(i));

        if (this.SLEEP_AFTER_SCAN) {
          await sleep(this.SLEEP_AFTER_SCAN_MS);
        }
      }
    } catch (e) {
      await this.logger.log({ message: `Failed scan '${dir}', cause ${e}`, tags: [LogTags.SCANNER], level: LogLevel.ERROR });
    }

    return content;
  }

  /**
   * Хелпер, выдающий содержимое ФС
   */
  private async getDirContent(dir: string): Promise<ScannedItem[]> {
    const data: ScannedItem[] = [];
    const items = await readdir(dir);

    for (const name of items) {
      const path = `${dir}/${name}`;
      const info = await stat(path);

      let hash;
      let id3;
      let duration;

      data.push({
        path,
        name,
        size: info.size,
        hash,
        id3,
        duration,
        isDir: info.isDirectory(),
        isFile: info.isFile(),
      });
    }

    return data;
  }
}
