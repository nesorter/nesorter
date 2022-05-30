import { Logger } from "../Logger";
import { StorageType } from "../Storage";

export class QueuesManager {
  constructor (private db: StorageType, private logger: Logger) {}

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
