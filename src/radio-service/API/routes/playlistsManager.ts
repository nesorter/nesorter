import Express from 'express';

import { ManualPlaylist, PlaylistsManager } from '@/radio-service/PlaylistsManager';
import { Logger } from '@/radio-service/Storage';
import { Streamer } from '@/radio-service/Streamer';
import { DtoUpdatePlaylist, LogLevel, LogTags, StorageType } from '@/radio-service/types';
import { withAdminToken, withLogger } from '@/radio-service/utils';

export const genPlaylistsManagerRoutes = (
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
      withAdminToken(
        withLogger(logger, (req, res) => {
          const { name, type, filehash } = req.body as {
            name: string;
            type: 'manual' | 'fs';
            filehash?: string;
          };
          playlistsManager
            .createQueue(name, type, filehash)
            .then((result) => res.json({ result }))
            .catch((e) => res.status(500).json(e));
        }),
      ),
    );

  api
    .route('/api/playlistsManager/queue/:queueId')
    .get(
      withLogger(logger, (req, res) => {
        playlistsManager
          .getQueueInstance(Number(req.params.queueId))
          .then((playlist) => playlist.getContent())
          .then((result) => res.json(result))
          .catch((e) => res.status(500).json(e));
      }),
    )
    .post(
      withAdminToken(
        withLogger(logger, (req, res) => {
          playlistsManager
            .getQueueInstance(Number(req.params.queueId))
            .then((queue) => {
              queue
                .update(req.body as DtoUpdatePlaylist)
                .then((result) => res.json({ result }))
                .catch((e) => {
                  logger.log({
                    message: `Failed update queue ${req.params.queueId}, ${e}`,
                    level: LogLevel.ERROR,
                    tags: [LogTags.API],
                  });
                  res.status(500).json(e);
                });
            })
            .catch((e) => res.status(500).json(e));
        }),
      ),
    )
    .delete(
      withAdminToken(
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
      ),
    );

  api.post(
    '/api/playlistsManager/streamStop',
    withAdminToken(
      withLogger(logger, (req, res) => {
        streamer.stopStream();
        res.json('scheduled');
      }),
    ),
  );

  api.post(
    '/api/playlistsManager/streamStart',
    withAdminToken(
      withLogger(logger, (req, res) => {
        streamer.startStream();
        res.json('scheduled');
      }),
    ),
  );
};
