import { ManualPlaylistItem } from '@prisma/client';

import { StorageType } from './Storage';

export class ManualPlaylist {
  constructor(private db: StorageType, private playlistId: number) {}

  async update(items: { order: number; filehash: string }[]): Promise<void> {
    const content = await this.getContent();
    const selectedForDelete = content.filter(
      (_) => items.find((__) => __.filehash === _.filehash) === undefined,
    );

    for (const item of selectedForDelete) {
      await this.db.manualPlaylistItem.delete({ where: { id: item.id } });
    }

    for (const item of items) {
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
          order: item.order,
        },
        where: {
          id: dbitem?.id || 0,
        },
      });
    }
  }

  async delete() {
    await this.db.playlists.delete({ where: { id: this.playlistId } });
  }

  getContent(): Promise<ManualPlaylistItem[]> {
    return this.db.manualPlaylistItem.findMany({ where: { playlistId: this.playlistId } });
  }
}
