import Express from 'express';

import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger.types';
import { PlaylistsManager } from '../../PlaylistsManager';
import { ManualPlaylist } from '../../PlaylistsManager.ManualPlaylist';
import { StorageType } from '../../Storage';
import { Streamer } from '../../Streamer';
import { withLogger } from '../../utils';

export const gen = (
  logger: Logger,
  api: Express.Application,
  playlistsManager: PlaylistsManager,
  streamer: Streamer,
  storage: StorageType,
) => {
  api
    .route('/api/playlistsManager/queues')
    .get(
      withLogger(logger, (req, res) => {
        playlistsManager
          .getQueues()
          .then((queues) => res.json(queues))
          .catch((e) => res.status(500).json(e));
      }),
    )
    .post(
      withLogger(logger, (req, res) => {
        const { name, type } = req.body as { name: string; type: 'manual' | 'smart' };
        playlistsManager
          .createQueue(name, type)
          .then((result) => res.json({ result }))
          .catch((e) => res.status(500).json(e));
      }),
    );

  api
    .route('/api/playlistsManager/queue/:queueId')
    .get(
      withLogger(logger, (req, res) => {
        const queue = new ManualPlaylist(storage, Number(req.params.queueId));
        queue
          .getContent()
          .then((result) => res.json(result))
          .catch((e) => res.status(500).json(e));
      }),
    )
    .post(
      withLogger(logger, (req, res) => {
        const queue = new ManualPlaylist(storage, Number(req.params.queueId));
        queue
          .update(req.body as { order: number; filehash: string }[])
          .then((result) => res.json({ result }))
          .catch((e) => {
            logger.log({
              message: `Failed update queue ${req.params.queueId}, ${e}`,
              level: LogLevel.ERROR,
              tags: [LogTags.API],
            });
            res.status(500).json(e);
          });
      }),
    )
    .delete(
      withLogger(logger, (req, res) => {
        const queue = new ManualPlaylist(storage, Number(req.params.queueId));
        queue
          .delete()
          .then((result) => res.json({ result }))
          .catch((e) => {
            logger.log({
              message: `Failed delete queue ${req.params.queueId}, ${e}`,
              level: LogLevel.ERROR,
              tags: [LogTags.API],
            });
            res.status(500).json(e);
          });
      }),
    );

  api.post(
    '/api/playlistsManager/streamStop',
    withLogger(logger, (req, res) => {
      streamer.stopStream();
      res.json('scheduled');
    }),
  );

  api.post(
    '/api/playlistsManager/streamStart',
    withLogger(logger, (req, res) => {
      streamer.startStream();
      res.json('scheduled');
    }),
  );
};
