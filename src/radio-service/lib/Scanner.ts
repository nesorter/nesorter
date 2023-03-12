import * as Sentry from '@sentry/node';
import { createHash } from 'crypto';
import { readdir, readFile, stat } from 'fs/promises';
import { parseBuffer } from 'music-metadata';

import { Chain, ScannedItem } from '../types/Scanner';
import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';
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
    private onScanned: (scanned: Chain) => void,
  ) {
    this._getChain()
      .then((_) => {
        this.chain = _;
        this.onScanned(this.chain);
      })
      .catch(Sentry.captureException);
  }

  async getFsItem(filehash: string) {
    try {
      return await this.db.fileItem.findFirstOrThrow({
        where: { filehash },
        include: { timings: true, metadata: true },
      });
    } catch (e) {
      this.logger.log({ level: LogLevel.ERROR, tags: [LogTags.SCANNER], message: `${e}` });
    }
  }

  async setTrim(filehash: string, trimStart: number, trimEnd: number) {
    try {
      await this.db.fileItemTimings.update({
        where: { fileItemHash: filehash },
        data: { trimStart, trimEnd },
      });
    } catch (e) {
      this.logger.log({ level: LogLevel.ERROR, tags: [LogTags.SCANNER], message: `${e}` });
    }
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
    const items = await this.db.fileItem.findMany({ include: { timings: true, metadata: true } });
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
        isClassified: false,
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

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
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
          const buffer = await readFile(scannedItem.path);
          const hashSum = createHash('sha256');
          hashSum.update(buffer);
          scannedItem.hash = hashSum.digest('hex');

          const parsedData = await parseBuffer(buffer, {
            duration: true,
            includeChapters: true,
            skipCovers: true,
          });

          scannedItem.duration = parsedData.format.duration;
          scannedItem.id3 = {
            artist: parsedData.common.artist || scannedItem.name,
            title: parsedData.common.title || 'unnamed',
          };

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
        this.logger.log({
          message: `Upsert record for '${scannedItem.name}' [${scannedItem.hash}]`,
          tags: [LogTags.SCANNER],
          level: LogLevel.INFO,
        });

        const metadata = {
          connectOrCreate: {
            create: {
              artist: scannedItem.id3?.artist || scannedItem.name,
              title: scannedItem.id3?.title || 'unnamed',
            },
            where: {
              fileItemHash: scannedItem.hash,
            },
          },
        };

        const timings = {
          connectOrCreate: {
            create: {
              trimStart: 0,
              trimEnd: 0,
              duration: scannedItem.duration,
            },
            where: {
              fileItemHash: scannedItem.hash,
            },
          },
        };

        await this.db.fileItem.upsert({
          where: {
            filehash: scannedItem.hash,
          },

          create: {
            filehash: scannedItem.hash,
            name: scannedItem.name,
            path: scannedItem.path,
            type: scannedItem.isDir ? 'dir' : 'file',
            metadata,
            timings,
          },

          update: {
            name: scannedItem.name,
            path: scannedItem.path,
            type: scannedItem.isDir ? 'dir' : 'file',
            metadata,
            timings,
          },
        });
      } catch (e) {
        this.logger.log({
          message: `Failed upsert record for '${scannedItem.name}' [${scannedItem.hash}], err: ${e}`,
          tags: [LogTags.SCANNER],
          level: LogLevel.ERROR,
        });
      }
    }

    this.scanInProgress = false;
    await this._getChain()
      .then((_) => {
        this.chain = _;
        this.onScanned(this.chain);
      })
      .catch(Sentry.captureException);
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
