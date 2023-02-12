import { ManualPlaylistItem } from '@prisma/client';

import { AbstractPlaylist } from './API/PlaylistManager.AbstractPlaylist';
import { Scanner } from './Scanner';
import { StorageType } from './Storage';

export class FSPlaylist implements AbstractPlaylist {
  cache: ManualPlaylistItem[] = [];

  constructor(private db: StorageType, private playlistId: number, private scanner: Scanner) {}

  update(): Promise<void> {
    return Promise.reject(new Error('Not implemented. You dont need update items in fs playlist'));
  }

  async delete() {
    await this.db.playlists.delete({ where: { id: this.playlistId } });
  }

  async getContent(): Promise<ManualPlaylistItem[]> {
    // if (!this.cache.length) {
    await this.initCache();
    // }

    return this.cache;
  }

  async initCache() {
    const playlist = await this.db.playlists.findFirst({ where: { id: this.playlistId } });
    if (!playlist) {
      return;
    }

    const fsItem = await this.db.fSItem.findFirst({
      where: { filehash: playlist.filehash },
    });
    if (!fsItem) {
      return;
    }

    const chain = Object.values(this.scanner.getChain());
    const fsItems = chain.filter(
      (item) => item.fsItem?.type === 'file' && item.fsItem?.path?.startsWith(fsItem.path),
    );

    this.cache = fsItems.map((i, index) => ({
      filehash: i.fsItem?.filehash || '',
      playlistId: this.playlistId,
      id: index,
      order: index,
    }));
  }
}
