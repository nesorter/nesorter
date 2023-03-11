import * as Sentry from '@sentry/node';

import config from './config';
import { PlaylistsManager } from './PlaylistsManager';
import { Queue } from './Queue';
import { StorageType } from './Storage';
import { shuffle } from './utils';

export class PlaylistsPlayHelper {
  constructor(
    private db: StorageType,
    private queue: Queue,
    private playlistsManager: PlaylistsManager,
  ) {}

  public async queuePlaylist(playlistId: number) {
    const playlist = await this.playlistsManager.getQueueInstance(playlistId);
    const items = await playlist.getContent();

    for (const item of items) {
      await this.queue.add(item.fileItemHash || '', undefined, playlistId);
    }
  }

  public async queueAllPlaylistsRandomly() {
    let playlistDuration = 0;
    const playlistId = shuffle(await this.db.playlist.findMany())[0]?.id;

    if (!playlistId) {
      return;
    }

    const playlist = await this.playlistsManager.getQueueInstance(playlistId);
    const items = shuffle(await playlist.getContent());

    for (const item of items) {
      if (item.fileItemHash === null) {
        continue;
      }

      await this.queue.add(item.fileItemHash, undefined, playlistId);

      const fileItem = await this.db.fileItem.findFirst({
        where: { filehash: item.fileItemHash },
        include: {
          timings: true,
          metadata: true,
        },
      });

      playlistDuration += fileItem?.timings?.duration || 0;
    }

    setTimeout(() => {
      this.queueAllPlaylistsRandomly().catch(Sentry.captureException);
    }, (playlistDuration - config.MPV_FADE_TIME) * 1000);
  }
}
