import { readFile, writeFile } from 'fs/promises'

export default class DBStorage {
  storage: Record<string, unknown> = {};

  constructor(onInit: () => void) {
    readFile('srv/db.json')
      .then(r => {
        this.storage = JSON.parse(r.toString());
        onInit();
      })
      .catch((e) => {
        console.log('FATAL: couldnt read db file', e);
        process.exit(0);
      });
  }

  async add(key: string, value: unknown) {
    this.storage[key] = value;
    return writeFile('srv/db.json', JSON.stringify(this.storage, null, 2));
  }
}
