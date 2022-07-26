import Express from 'express';
import { Logger } from '../../Logger';
import { Scanner } from '../../Scanner';
import { Streamer } from '../../Streamer';

export const gen = (api: Express.Application, logger: Logger, streamer: Streamer, scanner: Scanner) => {
  api.get('/api/logger', (_req, res) => {
    logger.getLogs()
      .then((logs) => res.json(logs))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/status', (_req, res) => {
    res.json({
      playing: streamer.playing,
      syncing: scanner.scanInProgress,
      streaming: streamer.streaming,
      currentFile: streamer.currentFile,
      currentPlaylistId: streamer.currentPlaylistId,
    });
  });
}
