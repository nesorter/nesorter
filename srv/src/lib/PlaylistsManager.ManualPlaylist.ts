import { PlaylistItem } from '@prisma/client';

import {
  AbstractPlaylist,
  AbstractPlaylistUpdateItem,
} from './API/PlaylistManager.AbstractPlaylist';
import { StorageType } from './Storage';

export class ManualPlaylist implements AbstractPlaylist {
  constructor(private db: StorageType, private playlistId: number) {}

  invalidateCache(): Promise<void> {
    return Promise.resolve();
  }

  async update(items: AbstractPlaylistUpdateItem[]): Promise<void> {
    await this.db.$transaction([
      this.db.playlistManualMeta.delete({
        where: { playlistId: this.playlistId },
        include: {
          playlistItems: true,
        },
      }),

      this.db.playlistManualMeta.create({
        data: {
          playlistId: this.playlistId,
          playlistItems: {
            connectOrCreate: items.map((item) => ({
              create: {
                fileItemHash: item.filehash,
                order: item.order,
              },
              where: {
                id: this.playlistId,
              },
            })),
          },
        },
      }),
    ]);
  }

  async delete() {
    await this.db.playlist.delete({
      where: { id: this.playlistId },
      include: { fsMeta: true, manualMeta: { include: { playlistItems: true } } },
    });
  }

  async getContent(): Promise<PlaylistItem[]> {
    const items = await this.db.playlistManualMeta.findFirstOrThrow({
      where: { playlistId: this.playlistId },
      include: { playlistItems: true },
    });

    return items.playlistItems;
  }
}
