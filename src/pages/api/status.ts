import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { IcecastStatus, LogLevel, LogTags } from '@/radio-service/types';
import { config } from '@/radio-service/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { scheduler, queue, scanner, streamer, logger } = getInstance();

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

    status = 200;
    response = {
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
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
