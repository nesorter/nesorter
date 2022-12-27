import Express from 'express';
import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger/types';
import { PlaylistsManager } from '../../PlaylistsManager';
import { ManualPlaylist } from '../../PlaylistsManager/Manual';
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
  api.route('/api/playlistsManager/queues')
    .get(withLogger(logger, (req, res) => {
      playlistsManager.getQueues()
        .then((queues) => res.json(queues))
        .catch((e) => res.status(500).json(e));
    }))
    .post(withLogger(logger, (req, res) => {
      const { name, type } = req.body as { name: string, type: 'manual' | 'smart' };
      playlistsManager.createQueue(name, type)
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    }));

  api.route('/api/playlistsManager/queue/:queueId')
    .get(withLogger(logger, (req, res) => {
      const queue = new ManualPlaylist(storage, Number(req.params.queueId));
      queue.getContent()
        .then((result) => res.json(result))
        .catch((e) => res.status(500).json(e));
    }))
    .post(withLogger(logger, (req, res) => {
      const queue = new ManualPlaylist(storage, Number(req.params.queueId));
      queue.update(req.body)
        .then((result) => res.json({ result }))
        .catch((e) => {
          logger.log({ message: `Failed update queue ${req.params.queueId}, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
          res.status(500).json(e)
        });
    }))
    .delete(withLogger(logger, (req, res) => {
      const queue = new ManualPlaylist(storage, Number(req.params.queueId));
      queue.delete()
        .then((result) => res.json({ result }))
        .catch((e) => {
          logger.log({ message: `Failed delete queue ${req.params.queueId}, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
          res.status(500).json(e)
        });
    }));

  api.post('/api/playlistsManager/streamStop', withLogger(logger, async (req, res) => {
    streamer.stopStream();
    res.json('scheduled');
  }));

  api.post('/api/playlistsManager/streamStart', withLogger(logger, async (req, res) => {
    streamer.startStream();
    res.json('scheduled');
  }));

  api.post('/api/playlistsManager/stopPlaylist', withLogger(logger, async (req, res) => {
    streamer.stopPlay();
    res.json('scheduled');
  }));

  api.post('/api/playlistManager/playAllPlaylists', withLogger(logger, async (req, res) => {
    try {
      const playlists: {hashes: string[], playlistId: string}[] = [];
      const playlistsIds = (await storage.playlists.findMany({ select: { id: true } })).map(_ => _.id.toString());

      for (let playlistId of playlistsIds) {
        const queue = new ManualPlaylist(storage, Number(playlistId));
        const items = await queue.getContent();
        const hashes: string[] = [];

        for (let item of items) {
          hashes.push(item.filehash);
        }

        playlists.push({ hashes, playlistId });
      }

      streamer.runPlaylists(playlists);
      res.json('ok');
    } catch (e) {
      logger.log({ message: `Failed stream queue, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
      res.status(500).json(e);
    }
  }));

  api.post('/api/playlistsManager/queue/:queueId/stream', withLogger(logger, async (req, res) => {
    try {
      // Disable streaming
      // streamer.startStream();
    } catch (e) {
      logger.log({ message: `Failed start stream process, but we can ignore this now, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
    }

    try {
      const queue = new ManualPlaylist(storage, Number(req.params.queueId));
      const items = await queue.getContent();
      const hashes: string[] = [];

      for (let item of items) {
        hashes.push(item.filehash);
      }

      streamer.runPlaylist(hashes, req.params.queueId);
      res.json('ok');
    } catch (e) {
      logger.log({ message: `Failed stream queue ${req.params.queueId}, ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
      res.status(500).json(e);
    }
  }));
}
