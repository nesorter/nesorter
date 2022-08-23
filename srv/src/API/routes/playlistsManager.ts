import Express from 'express';
import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger/types';
import { PlaylistsManager } from '../../PlaylistsManager';
import { ManualPlaylist } from '../../PlaylistsManager/Manual';
import { StorageType } from '../../Storage';
import { Streamer } from '../../Streamer';

export const gen = (
  logger: Logger,
  api: Express.Application,
  playlistsManager: PlaylistsManager,
  streamer: Streamer,
  storage: StorageType,
) => {
  api.route('/api/playlistsManager/queues')
    .get((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      playlistsManager.getQueues()
        .then((queues) => res.json(queues))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      const { name, type } = req.body as { name: string, type: 'manual' | 'smart' };
      playlistsManager.createQueue(name, type)
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    });

  api.route('/api/playlistsManager/queue/:queueId')
    .get((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      const queue = new ManualPlaylist(storage, Number(req.params.queueId));
      queue.getContent()
        .then((result) => res.json(result))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });

      const queue = new ManualPlaylist(storage, Number(req.params.queueId));
      queue.update(req.body)
        .then((result) => res.json({ result }))
        .catch((e) => {
          logger.log({ message: `Failed update queue ${req.params.queueId}, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
          res.status(500).json(e)
        });
    });

  api.post('/api/playlistsManager/streamStop', async (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    streamer.stopStream();
    res.json('scheduled');
  });

  api.post('/api/playlistsManager/streamStart', async (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    streamer.startStream();
    res.json('scheduled');
  });

  api.post('/api/playlistsManager/stopPlaylist', async (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    streamer.stopPlay();
    res.json('scheduled');
  });

  api.post('/api/playlistsManager/queue/:queueId/stream', async (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });

    try {
      streamer.startStream();
    } catch (e) {
      logger.log({ message: `Failed start stream process, but we can ignore this now, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
    }

    try {
      const queue = new ManualPlaylist(storage, Number(req.params.queueId));
      const items = await queue.getContent();
      const pathlist: string[] = [];

      for (let item of items) {
        pathlist.push(item.filehash);
      }

      await streamer.runPlaylist(pathlist, req.params.queueId);
      res.json('ok');
    } catch (e) {
      logger.log({ message: `Failed stream queue ${req.params.queueId}, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
      res.status(500).json(e);
    }
  });
}
