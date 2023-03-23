import { PlaylistItem } from '@prisma/client';

import { AbstractPlaylist } from '@/radio-service/PlaylistsManager';
import type { DtoUpdatePlaylist, StorageType } from '@/radio-service/types';

export class ManualPlaylist implements AbstractPlaylist {
  constructor(private db: StorageType, private playlistId: number) {}

  invalidateCache(): Promise<void> {
    return Promise.resolve();
  }

  async update({ items, playlistData }: DtoUpdatePlaylist): Promise<void> {
    const allManualMetas = await this.db.playlistManualMeta.findMany({
      where: { playlistId: this.playlistId },
    });

    await this.db.$transaction([
      this.db.playlist.update({
        where: { id: this.playlistId },
        data: { name: playlistData.name },
      }),

      ...allManualMetas.map((manualMeta) =>
        this.db.playlistManualMeta.delete({
          where: { id: Number(manualMeta.id) },
        }),
      ),

      this.db.playlistManualMeta.create({
        data: {
          playlistId: this.playlistId,
          playlistItems: {
            create: items.map((item) => ({
              fileItemHash: item.filehash,
              order: item.order,
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
    const items = await this.db.playlistManualMeta.findFirst({
      where: { playlistId: this.playlistId },
      include: { playlistItems: true },
    });

    return items?.playlistItems || [];
  }
}
