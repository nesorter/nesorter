import { PlaylistItem } from '@prisma/client';

import { DtoUpdatePlaylist } from '@/radio-service/types/Playlist';

import { AbstractPlaylist } from './API/PlaylistManager.AbstractPlaylist';
import { Scanner } from './Scanner';
import { StorageType } from './Storage';

export class FSPlaylist implements AbstractPlaylist {
  cache: PlaylistItem[] = [];

  constructor(private db: StorageType, private playlistId: number, private scanner: Scanner) {}

  async update({ playlistData }: DtoUpdatePlaylist): Promise<void> {
    await this.db.$transaction([
      this.db.playlist.update({
        where: { id: this.playlistId },
        data: { name: playlistData.name },
      }),

      this.db.playlistFsMeta.update({
        where: { playlistId: this.playlistId },
        data: { fileItemHash: playlistData.baseDirectory },
      }),
    ]);
  }

  async delete() {
    await this.db.playlist.delete({ where: { id: this.playlistId }, include: { fsMeta: true } });
  }

  async getContent(): Promise<PlaylistItem[]> {
    if (!this.cache.length) {
      await this.initCache();
    }

    return this.cache;
  }

  async invalidateCache(): Promise<void> {
    this.cache = [];
    return Promise.resolve();
  }

  async initCache() {
    const playlistRecord = await this.db.playlist.findFirst({
      where: { id: this.playlistId },
      include: { fsMeta: { include: { fileItem: true } } },
    });

    if (!playlistRecord) {
      return;
    }

    if (!playlistRecord.fsMeta?.fileItem) {
      return;
    }

    const { fileItem } = playlistRecord.fsMeta;

    const chain = Object.values(this.scanner.getChain());
    const fileItems = chain.filter(
      (item) => item.fsItem?.type === 'file' && item.fsItem?.path?.startsWith(fileItem.path),
    );

    this.cache = fileItems.map((i, index) => ({
      fileItemHash: i.fsItem?.filehash || '',
      playlistManualMetaId: null,
      playlistId: this.playlistId,
      id: index,
      order: index,
    }));
  }
}
