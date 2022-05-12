import DBStorage from "./storage";

type QueueItem = {
  order: number;
  filepath: string;
};

type QueueType = {
  id: string;
  name: string;
  type: 'manual' | 'smart';
}

export class Queue {
  db: DBStorage;
  id: string;

  constructor(id: string, db: DBStorage) {
    this.db = db;
    this.id = id;
  }

  get key(): string {
    return `queue-${this.id}`;
  }

  async init(name?: string): Promise<void> {
    if (this.db.storage[this.key] === undefined) {
      await this.db.add(this.key, []);
    }

    if (!(this.db.storage.queueList as QueueType[])?.some(q => q.id === this.key)) {
      await this.db.add(
        'queueList',
        [
          ...(this.db.storage.queueList as QueueType[]),
          {
            id: this.key,
            name: name || this.key,
            type: 'manual',
          } as QueueType
        ]
      );
    }
  }

  async getQueue(): Promise<QueueItem[]> {
    return this.db.storage[this.key] as QueueItem[];
  }

  async addInQueue(filePath: string): Promise<void> {
    const last = (await this.getQueue()).at(-1);
    let order = 0;

    if (last !== undefined) {
      order = last.order + 10;
    }

    await this.db.add(this.key, [...(await this.getQueue()), { order, filePath }]);
  }
}
