import * as Sentry from '@sentry/node';
import Express from 'express';

import { PlaylistsPlayHelper } from '@/radio-service/PlaylistsManager';
import { Queue } from '@/radio-service/Scheduler';
import { Logger } from '@/radio-service/Storage';
import { withAdminToken, withLogger } from '@/radio-service/utils';

export const getPlayerRoutes = (
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
          playHelper.queueAllPlaylistsRandomly().catch(Sentry.captureException);
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
          playHelper.queuePlaylist(Number(id)).catch(Sentry.captureException);
          res.status(200).json({ message: 'queued' });
        } catch (e) {
          res.status(500).json(e);
        }
      }),
    ),
  );
};
