import axios from 'axios';
import Express from 'express';
import { XMLParser } from 'fast-xml-parser';

import { Logger } from '@/radio-service/lib/Logger';
import { Queue } from '@/radio-service/lib/Queue';
import { Scanner } from '@/radio-service/lib/Scanner';
import { Scheduler } from '@/radio-service/lib/Scheduler';
import { Streamer } from '@/radio-service/lib/Streamer';
import { IcecastStatus, LogLevel, LogTags, ServiceStatus } from '@/radio-service/types';
import { config, withAdminToken, withLogger } from '@/radio-service/utils';

export const gen = (
  api: Express.Application,
  logger: Logger,
  streamer: Streamer,
  scanner: Scanner,
  scheduler: Scheduler,
  queue: Queue,
) => {
  api.post(
    '/api/restart',
    withAdminToken(
      withLogger(logger, (_req, res) => {
        res.status(200).json({ message: 'restart' });
        process.exit(0);
      }),
    ),
  );

  api.get('/api/status', async (_req, res) => {
    let fileData = null;
    let playlistData = null;
    let schedulingData = null;

    if (queue.state === 'playing') {
      fileData = await scanner.getFsItem(queue.currentFileHash || '');
      playlistData = await scheduler.getPlaylist(Number(queue.currentPlaylistId));

      if (scheduler.currentItem !== -1) {
        const schedulerItems = await scheduler.getItems();
        schedulingData = schedulerItems.find((_) => _.id === scheduler.currentItem);
      }
    }

    let icecastData = {};
    if (streamer.streaming) {
      try {
        const xml = await axios.get(
          `http://${config.SHOUT_HOST}:${config.SHOUT_PORT}/admin/stats`,
          {
            auth: {
              username: config.SHOUT_ADMIN_USER,
              password: config.SHOUT_ADMIN_PASSWORD,
            },
          },
        );
        const parser = new XMLParser();
        icecastData = parser.parse(xml.data as string) as IcecastStatus;
      } catch (e) {
        logger.log({
          message: e?.toString() || '',
          tags: [LogTags.STREAMER],
          level: LogLevel.ERROR,
        });
      }
    }

    const status: ServiceStatus = {
      scheduling: scheduler.processing,
      playing: queue.state === 'playing',
      syncing: scanner.scanInProgress,
      streaming: streamer.streaming,
      steamUrl: config.SHOUT_URL,
      currentFile: queue.currentFileHash,
      queue: {
        items: queue.items,
        currentOrder: queue.currentOrder || undefined,
        state: queue.state,
      },
      thumbnailPath: `/api/scanner/image/${queue.currentFileHash}`,
      fileData: fileData || undefined,
      schedulingData: schedulingData || undefined,
      playlistData: playlistData || undefined,
      currentPlaylistId: queue.currentPlaylistId,
      icecastData,
    };

    res.json(status);
  });
};
