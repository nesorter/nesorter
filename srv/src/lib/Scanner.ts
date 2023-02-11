import { createHash } from 'crypto';
import { readdir, readFile, stat } from 'fs/promises';
import musicDuration from 'get-audio-duration';
import NodeID3 from 'node-id3';

import { Classificator } from './Classificator';
import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';
import { Chain, ScannedItem } from './Scanner.types';
import { StorageType } from './Storage';
import { sleep } from './utils';

export class Scanner {
  SLEEP_AFTER_SCAN = true;
  SLEEP_AFTER_SCAN_MS = 1;
  chain: Chain = {};
  scanInProgress = false;

  constructor(
    private db: StorageType,
    private logger: Logger,
    private classificator: Classificator,
    onScanned: (scanned: Chain) => void,
  ) {
    this._getChain().then((_) => {
      this.chain = _;
      onScanned(this.chain);
    });
  }

  getFsItem(filehash: string) {
    return this.db.fSItem.findFirst({ where: { filehash } });
  }

  setTrim(filehash: string, trimStart: number, trimEnd: number) {
    return this.db.fSItem.update({ where: { filehash }, data: { trimStart, trimEnd } });
  }

  getChain(): Chain {
    return this.chain;
  }

  /**
   * Создает связный список fsItem; Воссоздаёт структуру файловой системы
   */
  async _getChain(): Promise<Chain> {
    let time = Date.now();
    const chain: Chain = {};
    const items = await this.db.fSItem.findMany();
    this.logger.log({
      message: `Read track from DB took ${Date.now() - time}ms`,
      tags: [LogTags.SCANNER],
      level: LogLevel.DEBUG,
    });
    time = Date.now();

    for (const item of items) {
      const chunks = item.path.split('/').filter((i) => i !== '');
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
          path: path.join('/'),
          key: chunk,
          name: path[index],
          parent: index > 0 ? pathIndexed[index - 1] : null,
        };
      });
    }

    this.logger.log({
      message: `Construct chain took ${Date.now() - time}ms`,
      tags: [LogTags.SCANNER],
      level: LogLevel.DEBUG,
    });
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
    const scannedItems = await this.scan(dir, filter);

    for (const index in scannedItems) {
      const scannedItem = scannedItems[index];
      const startTime = Date.now();

      if (scannedItem.isDir) {
        this.logger.log({
          message: `Processing dir for ${index}/${scannedItems.length} for "${scannedItem.name}" for "${scannedItem.path}"`,
          tags: [LogTags.SCANNER],
          level: LogLevel.DEBUG,
        });

        const hashSum = createHash('sha256');
        hashSum.update(scannedItem.name);
        scannedItem.hash = hashSum.digest('hex');

        scannedItem.id3 = {
          artist: 'undefined',
          title: 'undefined',
        };

        scannedItem.duration = 0;
      } else {
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
          this.logger.log({
            message: `Scan meta (took ${time}ms) for ${index}/${scannedItems.length} for file "${scannedItem.name}"`,
            tags: [LogTags.SCANNER],
            level: LogLevel.DEBUG,
          });
        } catch (e) {
          this.logger.log({
            message: `Scan meta failed for file "${scannedItem.name}" cause "${
              (e as Error).message
            }"`,
            tags: [LogTags.SCANNER],
            level: LogLevel.ERROR,
          });
          continue;
        }
      }

      try {
        const item = await this.db.fSItem.findFirst({ where: { filehash: scannedItem.hash } });

        if (item) {
          this.logger.log({
            message: `Update record for '${scannedItem.name}' [${scannedItem.hash}]`,
            tags: [LogTags.SCANNER],
            level: LogLevel.INFO,
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
              filehash: scannedItem.hash,
            },
          });
        } else {
          this.logger.log({
            message: `Create record for '${scannedItem.name}' [${scannedItem.hash}]`,
            tags: [LogTags.SCANNER],
            level: LogLevel.INFO,
          });

          await this.db.fSItem.create({
            data: {
              filehash: scannedItem.hash || 'nulled',
              name: scannedItem.name,
              path: scannedItem.path,
              type: scannedItem.isDir ? 'dir' : 'file',
              id3Artist: scannedItem.id3?.artist || 'nulled',
              id3Title: scannedItem.id3?.title || 'nulled',
              duration: scannedItem.duration || 0,
            },
          });
        }
      } catch (e) {
        this.logger.log({
          message: `Failed process record for '${scannedItem.name}' [${scannedItem.hash}]`,
          tags: [LogTags.SCANNER],
          level: LogLevel.ERROR,
        });
      }
    }

    this.scanInProgress = false;
    this._getChain().then((_) => {
      this.chain = _;
    });
  }

  /**
   * Рекурсивная функция сканирования ФС
   */
  private async scan(dir: string, filter: (item: ScannedItem) => boolean): Promise<ScannedItem[]> {
    this.logger.log({
      message: `Scan '${dir}'`,
      tags: [LogTags.SCANNER],
      level: LogLevel.DEBUG,
    });

    const content: ScannedItem[] = [];

    try {
      const dirContent = await this.getDirContent(dir);

      this.logger.log({
        message: `Scanned '${dir}', found ${dirContent.length} entries`,
        tags: [LogTags.SCANNER],
        level: LogLevel.DEBUG,
      });

      for (const item of dirContent) {
        if (!item.isDir) {
          if (filter(item)) {
            content.push(item);
          }

          continue;
        } else {
          content.push(item);
        }

        const next = await this.scan(item.path, filter);
        next.forEach((i) => content.push(i));

        if (this.SLEEP_AFTER_SCAN) {
          await sleep(this.SLEEP_AFTER_SCAN_MS);
        }
      }
    } catch (e) {
      this.logger.log({
        message: `Failed scan '${dir}', cause ${e}`,
        tags: [LogTags.SCANNER],
        level: LogLevel.ERROR,
      });
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
