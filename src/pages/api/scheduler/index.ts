import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { isAuthorizedRequest } from '@/radio-service/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { scheduler } = getInstance();

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      const { name, start, end, playlistIds, withMerging } = req.body as {
        name: string;
        start: number;
        end: number;
        playlistIds: string;
        withMerging?: number;
      };

      status = 200;
      response = await scheduler.createItem(name, start, end, playlistIds, withMerging);
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
