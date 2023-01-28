import axios from 'axios';
import Express from 'express';
import { XMLParser } from 'fast-xml-parser';

import config from '../../config';
import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger.types';
import { Queue } from '../../Queue';
import { Scanner } from '../../Scanner';
import { Scheduler } from '../../Scheduler';
import { Streamer } from '../../Streamer';

export const gen = (
  api: Express.Application,
  logger: Logger,
  streamer: Streamer,
  scanner: Scanner,
  scheduler: Scheduler,
  queue: Queue,
) => {
  api.get('/api/status', async (_req, res) => {
    let fileData = null;
    let playlistData = null;

    if (queue.state === 'playing') {
      fileData = await scanner.getFsItem(queue.currentFileHash || '');
      playlistData = await scheduler.getPlaylist(Number(queue.currentPlaylistId));
    }

    let icecastData = {};
    try {
      const xml = await axios.get(`http://${config.SHOUT_HOST}:${config.SHOUT_PORT}/admin/stats`, {
        auth: {
          username: config.SHOUT_ADMIN_USER,
          password: config.SHOUT_ADMIN_PASSWORD,
        },
      });
      const parser = new XMLParser();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      icecastData = parser.parse(xml.data as string);
    } catch (e) {
      logger.log({ message: e?.toString() || '', tags: [LogTags.STREAMER], level: LogLevel.ERROR });
    }

    res.json({
      scheduling: scheduler.processing,
      playing: queue.state === 'playing',
      syncing: scanner.scanInProgress,
      streaming: streamer.streaming,
      currentFile: queue.currentFileHash,
      queue: {
        items: queue.items,
        currentOrder: queue.currentOrder,
        state: queue.state,
      },
      thumbnailPath: `/api/scanner/image/${queue.currentFileHash}`,
      fileData,
      playlistData,
      currentPlaylistId: queue.currentPlaylistId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      icecastData,
    });
  });
};
