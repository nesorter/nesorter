import { ManualQueueItem } from "@prisma/client";
import { StorageType } from "../Storage";

export class Manual {
  constructor (private db: StorageType, private queueId: number) {}

  async update(items: { order: number; filehash: string }[]): Promise<void> {
    for (let item of items) {
      // Беру тут айтем из БД потому что... какой-то странный ORM, даёт в блоке WHERE указать только Id
      const dbitem = await this.db.manualQueueItem.findFirst({
        where: {
          filehash: item.filehash,
          queueId: this.queueId,
        },
      });

      await this.db.manualQueueItem.upsert({
        create: {
          filehash: item.filehash,
          order: item.order,
          queueId: this.queueId,
        },
        update: {
          order: item.order
        },
        where: {
          id: dbitem?.id
        }
      });
    }
  }

  getContent(): Promise<ManualQueueItem[]> {
    return this.db.manualQueueItem.findMany({ where: { queueId: this.queueId } });
  }
}
