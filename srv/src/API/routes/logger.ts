import Express from 'express';
import { Logger } from '../../Logger';
import { Scanner } from '../../Scanner';
import { Scheduler } from '../../Scheduler';
import { Streamer } from '../../Streamer';

export const gen = (api: Express.Application, logger: Logger, streamer: Streamer, scanner: Scanner, scheduler: Scheduler) => {
  api.get('/api/logger', (_req, res) => {
    logger.getLogs()
      .then((logs) => res.json(logs))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/status', (_req, res) => {
    res.json({
      scheduling: scheduler.processing,
      playing: streamer.playing,
      syncing: scanner.scanInProgress,
      streaming: streamer.streaming,
      currentFile: streamer.currentFile,
      currentPlaylistId: streamer.currentPlaylistId,
    });
  });
}
