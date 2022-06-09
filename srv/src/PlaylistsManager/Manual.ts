import { ManualPlaylistItem } from "@prisma/client";
import { StorageType } from "../Storage";

export class ManualPlaylist {
  constructor (private db: StorageType, private playlistId: number) {}

  async update(items: { order: number; filehash: string }[]): Promise<void> {
    for (let item of items) {
      // Беру тут айтем из БД потому что... какой-то странный ORM, даёт в блоке WHERE указать только Id
      const dbitem = await this.db.manualPlaylistItem.findFirst({
        where: {
          filehash: item.filehash,
          playlistId: this.playlistId,
        },
      });

      await this.db.manualPlaylistItem.upsert({
        create: {
          filehash: item.filehash,
          order: item.order,
          playlistId: this.playlistId,
        },
        update: {
          order: item.order
        },
        where: {
          id: dbitem?.id || 0
        }
      });
    }
  }

  getContent(): Promise<ManualPlaylistItem[]> {
    return this.db.manualPlaylistItem.findMany({ where: { playlistId: this.playlistId } });
  }
}
