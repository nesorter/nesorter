import { readdir, stat } from 'fs/promises';
import DBStorage from './storage';
import { sleep } from './utils';

type ScanParams = {
  path: string;
  filterRegExp: RegExp;
}

type ScannedItem = {
  path: string,
  name: string,
  size: number,
  isDir: boolean,
  isFile: boolean
};

type Chain = Record<string, {
  type: 'file' | 'dir',
  key: string,
  name: string,
  link: string | null,
  meta?: ScannedItem
}>;

export default class Scanner {
  SLEEP_AFTER_SCAN = true;
  SLEEP_AFTER_SCAN_MS = 1;

  finded: ScannedItem[] = [];
  chain: Chain = {};
  db: DBStorage;

  constructor(db: DBStorage) {
    this.db = db;
  }

  async scan({ path, filterRegExp }: ScanParams) {
    this.finded = await this.getFilesRecursively(path, ({ name }) => filterRegExp.test(name));
    this.finded.forEach(item => this.putInChain(item));
  }

  private putInChain(item: ScannedItem) {
    const chunks = item.path.split('/').filter(i => i !== '');
    const path: string[] = chunks.slice(0, chunks.length - 1);
    const filename: string = chunks.at(-1) || 'NULL';
    const pathIndexed = path.map((c, i) => `${i}-${c}`);
    const fileIndexed = `${pathIndexed.join('-')}-${filename}`;

    this.chain[fileIndexed] = {
      type: 'file',
      key: fileIndexed,
      name: filename,
      link: pathIndexed.at(-1) || null,
      meta: item,
    };

    pathIndexed.forEach((chunk, index) => {
      if (this.chain[chunk] !== undefined) {
        return;
      }

      this.chain[chunk] = {
        type: 'dir',
        key: chunk,
        name: path[index],
        link: index > 0 ? pathIndexed[index - 1] : null,
      }
    });
  }

  private async getFilesRecursively(dir: string, filter: (item: ScannedItem) => boolean): Promise<ScannedItem[]> {
    let content: ScannedItem[] = [];

    const dirContent = await this.getDirContent(dir);
    for (const item of dirContent) {
      if (!item.isDir) {
        if (filter(item)) {
          content.push(item);
        }
        continue;
      }

      const next = await this.getFilesRecursively(item.path, filter);
      next.forEach((i) => content.push(i));

      if (this.SLEEP_AFTER_SCAN) {
        await sleep(this.SLEEP_AFTER_SCAN_MS);
      }
    }

    return content;
  }

  private async getDirContent(dir: string): Promise<ScannedItem[]> {
    const data: ScannedItem[] = [];
    const items = await readdir(dir);

    for (const name of items) {
      const path = `${dir}/${name}`;
      const info = await stat(path);

      data.push({
        path,
        name,
        size: info.size,
        isDir: info.isDirectory(),
        isFile: info.isFile(),
      });
    }

    return data;
  }
}
