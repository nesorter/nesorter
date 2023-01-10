import Express from 'express';
import { Logger } from 'lib/Logger';
import { PlaylistsPlayHelper } from 'lib/PlaylistsPlayHelper';
import { Queue } from 'lib/Queue';
import { withLogger } from 'lib/utils';

export const gen = (
  logger: Logger,
  api: Express.Application,
  queue: Queue,
  playHelper: PlaylistsPlayHelper,
) => {
  api.post(
    '/api/player/play',
    withLogger(logger, (_req, res) => {
      try {
        queue.play();
        res.status(200).json({ message: 'started' });
      } catch (e) {
        res.status(500).json(e);
      }
    }),
  );

  api.post(
    '/api/player/stop',
    withLogger(logger, (_req, res) => {
      try {
        queue.stop();
        res.status(200).json({ message: 'stopped' });
      } catch (e) {
        res.status(500).json(e);
      }
    }),
  );

  api.post(
    '/api/player/clear',
    withLogger(logger, (_req, res) => {
      try {
        queue.clear();
        res.status(200).json({ message: 'cleared' });
      } catch (e) {
        res.status(500).json(e);
      }
    }),
  );

  api.post(
    '/api/player/helper/random',
    withLogger(logger, (_req, res) => {
      try {
        playHelper.queueAllPlaylistsRandomly();
        res.status(200).json({ message: 'queued' });
      } catch (e) {
        res.status(500).json(e);
      }
    }),
  );

  api.post(
    '/api/player/helper/playlist/:id',
    withLogger(logger, (req, res) => {
      try {
        const { id } = req.params as { id: string };
        playHelper.queuePlaylist(Number(id));
        res.status(200).json({ message: 'queued' });
      } catch (e) {
        res.status(500).json(e);
      }
    }),
  );
};
