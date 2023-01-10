import Express from 'express';
import { Logger } from 'lib/Logger';
import { Queue } from 'lib/Queue';
import { Scanner } from 'lib/Scanner';
import { Scheduler } from 'lib/Scheduler';
import { Streamer } from 'lib/Streamer';

export const gen = (api: Express.Application, logger: Logger, streamer: Streamer, scanner: Scanner, scheduler: Scheduler, queue: Queue) => {
  api.get('/api/logger', (_req, res) => {
    logger.getLogs()
      .then((logs) => res.json(logs))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/status', async (_req, res) => {
    let fileData = null;
    let playlistData = null;

    if (queue.state === 'playing') {
      fileData = await scanner.getFsItem(queue.currentFileHash || '');
      playlistData = await scheduler.getPlaylist(Number(queue.currentPlaylistId));
    }

    res.json({
      scheduling: scheduler.processing,
      playing: queue.state === 'playing',
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
      currentPlaylistId: queue.currentPlaylistId,
    });
  });
}
