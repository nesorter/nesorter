import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { isAuthorizedRequest } from '@/radio-service/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { playlistsManager } = getInstance();

    if (req.method === 'GET') {
      status = 200;
      response = await playlistsManager.getQueues();
    }

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      const { name, type, filehash } = req.body as {
        name: string;
        type: 'manual' | 'fs';
        filehash?: string;
      };

      status = 200;
      response = await playlistsManager.createQueue(name, type, filehash);
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
