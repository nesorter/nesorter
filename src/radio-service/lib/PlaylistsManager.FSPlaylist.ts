import { PlaylistItem } from '@prisma/client';

import { DtoUpdatePlaylist } from '@/radio-service/types/Playlist';

import { AbstractPlaylist } from './PlaylistManager.AbstractPlaylist';
import { Scanner } from './Scanner';
import { StorageType } from './Storage';

export class FSPlaylist implements AbstractPlaylist {
  cache: PlaylistItem[] = [];

  constructor(private db: StorageType, private playlistId: number, private scanner: Scanner) {}

  async update({ playlistData }: DtoUpdatePlaylist): Promise<void> {
    const allFsMetas = await this.db.playlistFsMeta.findMany({
      where: { playlistId: this.playlistId },
    });

    await this.db.$transaction([
      this.db.playlist.update({
        where: { id: this.playlistId },
        data: { name: playlistData.name },
      }),

      ...allFsMetas.map((fsMeta) =>
        this.db.playlistFsMeta.delete({
          where: { id: Number(fsMeta.playlistId) },
        }),
      ),

      this.db.playlistFsMeta.create({
        data: {
          fileItemHash: playlistData.baseDirectory,
          playlistId: this.playlistId,
        },
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

    if (!playlistRecord.fsMeta) {
      return;
    }

    const fsMetaData = playlistRecord.fsMeta[0];

    if (!fsMetaData?.fileItem) {
      return;
    }

    const { fileItem } = fsMetaData;

    if (!fileItem) {
      return;
    }

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
