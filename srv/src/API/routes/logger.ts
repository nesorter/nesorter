import Express from 'express';
import { Logger } from '../../Logger';
import { Queue } from '../../Queue';
import { Scanner } from '../../Scanner';
import { Scheduler } from '../../Scheduler';
import { Streamer } from '../../Streamer';

export const gen = (api: Express.Application, logger: Logger, streamer: Streamer, scanner: Scanner, scheduler: Scheduler, queue: Queue) => {
  api.get('/api/logger', (_req, res) => {
    logger.getLogs()
      .then((logs) => res.json(logs))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/status', async (_req, res) => {
    let fileData = null;
    let playlistData = null;

    if (streamer.playing) {
      fileData = await scanner.getFsItem(queue.currentFileHash || '');
      playlistData = await scheduler.getPlaylist(Number(streamer.currentPlaylistId));
    }

    res.json({
      scheduling: scheduler.processing,
      playing: streamer.playing,
      syncing: scanner.scanInProgress,
      streaming: streamer.streaming,
      currentFile: queue.currentFileHash,
      queue: {
        items: queue.items,
        currentOrder: queue.currentOrder,
        state: queue.state,
      },
      thumbnailPath: `/api/scanner/image/${queue.currentFileHash}`,
      fileData,
      playlistData,
      currentPlaylistId: streamer.currentPlaylistId,
    });
  });
}
