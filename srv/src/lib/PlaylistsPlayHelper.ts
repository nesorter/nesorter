import { Queue } from 'lib/Queue';
import { StorageType } from "lib/Storage";
import { shuffle } from 'lib/utils';
import config from 'lib/config';

export class PlaylistsPlayHelper {
  constructor (private db: StorageType, private queue: Queue) {}

  public async queuePlaylist(playlistId: number) {
    const items = await this.db.manualPlaylistItem.findMany({ where: { playlistId } });
    for (let item of items) {
      await this.queue.add(item.filehash, undefined, playlistId);
    }
  }

  public async queueAllPlaylistsRandomly() {
    let playlistDuration = 0;
    let playlist = shuffle(await this.db.playlists.findMany())[0];
    if (!playlist) {
      return;
    }

    const items = shuffle(await this.db.manualPlaylistItem.findMany({ where: { playlistId: playlist.id } }));
    for (let item of items) {
      await this.queue.add(item.filehash, undefined, playlist.id);
      const fsItem = await this.db.fSItem.findFirst({ where: { filehash: item.filehash } });
      playlistDuration += fsItem?.duration || 0;
    }

    setTimeout(() => {
      this.queueAllPlaylistsRandomly();
    }, (playlistDuration - config.MPV_FADE_TIME) * 1000);
  }
}
