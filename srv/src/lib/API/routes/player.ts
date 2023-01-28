import Express from 'express';

import { Logger } from '../../Logger';
import { PlaylistsPlayHelper } from '../../PlaylistsPlayHelper';
import { Queue } from '../../Queue';
import { withAdminToken, withLogger } from '../../utils';

export const gen = (
  logger: Logger,
  api: Express.Application,
  queue: Queue,
  playHelper: PlaylistsPlayHelper,
) => {
  api.post(
    '/api/player/play',
    withAdminToken(
      withLogger(logger, (_req, res) => {
        try {
          queue.play();
          res.status(200).json({ message: 'started' });
        } catch (e) {
          res.status(500).json(e);
        }
      }),
    ),
  );

  api.post(
    '/api/player/stop',
    withAdminToken(
      withLogger(logger, (_req, res) => {
        try {
          queue.stop();
          res.status(200).json({ message: 'stopped' });
        } catch (e) {
          res.status(500).json(e);
        }
      }),
    ),
  );

  api.post(
    '/api/player/clear',
    withAdminToken(
      withLogger(logger, (_req, res) => {
        try {
          queue.clear();
          res.status(200).json({ message: 'cleared' });
        } catch (e) {
          res.status(500).json(e);
        }
      }),
    ),
  );

  api.post(
    '/api/player/helper/random',
    withAdminToken(
      withLogger(logger, (_req, res) => {
        try {
          playHelper.queueAllPlaylistsRandomly();
          res.status(200).json({ message: 'queued' });
        } catch (e) {
          res.status(500).json(e);
        }
      }),
    ),
  );

  api.post(
    '/api/player/helper/playlist/:id',
    withAdminToken(
      withLogger(logger, (req, res) => {
        try {
          const { id } = req.params as { id: string };
          playHelper.queuePlaylist(Number(id));
          res.status(200).json({ message: 'queued' });
        } catch (e) {
          res.status(500).json(e);
        }
      }),
    ),
  );
};
