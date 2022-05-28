import { StorageType } from "../Storage";

export class QueuesManager {
  constructor (private db: StorageType) {}

  async createQueue(name: string, type: 'manual' | 'smart') {
    return await this.db.queues.create({
      data: {
        name,
        type,
      },
    });
  }

  async getQueues() {
    return this.db.queues.findMany();
  }
}
