import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { ManualPlaylist } from '@/radio-service/PlaylistsManager';
import { DtoUpdatePlaylist } from '@/radio-service/types';
import { isAuthorizedRequest } from '@/radio-service/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { playlistsManager, storage } = getInstance();

    if (req.method === 'GET') {
      status = 200;
      response = await playlistsManager
        .getQueueInstance(Number(req.query.queueId))
        .then((playlist) => playlist.getContent());
    }

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      status = 200;
      response = await playlistsManager
        .getQueueInstance(Number(req.query.queueId))
        .then((queue) => queue.update(req.body as DtoUpdatePlaylist));
    }

    if (req.method === 'DELETE' && isAuthorizedRequest(req)) {
      const queue = new ManualPlaylist(storage, Number(req.query.queueId));
      status = 200;
      response = await queue.delete();
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
