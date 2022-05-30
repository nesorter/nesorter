import Express from 'express';
import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger/types';
import { QueuesManager } from '../../QueuesManager';
import { Manual } from '../../QueuesManager/Manual';
import { Scanner } from '../../Scanner';
import { StorageType } from '../../Storage';
import { Streamer } from '../../Streamer';

export const gen = (
  logger: Logger,
  api: Express.Application,
  queuesManager: QueuesManager,
  streamer: Streamer,
  storage: StorageType,
  scanner: Scanner,
) => {
  api.route('/api/queuesManager/queues')
    .get((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      queuesManager.getQueues()
        .then((queues) => res.json(queues))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      const { name, type } = req.body as { name: string, type: 'manual' | 'smart' };
      queuesManager.createQueue(name, type)
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    });

  api.route('/api/queuesManager/queue/:queueId')
    .get((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      const queue = new Manual(storage, Number(req.params.queueId));
      queue.getContent()
        .then((result) => res.json(result))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      const queue = new Manual(storage, Number(req.params.queueId));
      queue.update(req.body)
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    });

  api.post('/api/queuesManager/queue/:queueId/stream', async (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    try {
      const queue = new Manual(storage, Number(req.params.queueId));
      const items = await queue.getContent();
      const pathlist: string[] = [];

      for (let item of items) {
        const fsitem = await scanner.getFsItem(item.filehash);
        pathlist.push(fsitem?.path || '');
      }

      await streamer.runPlaylist(pathlist, 'list.txt');
    } catch (e) {
      res.status(500).json(e);
    }
  });
}
