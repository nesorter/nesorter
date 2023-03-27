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
      const { id, data } = req.body as {
        id: number;
        data: {
          name: string;
          endAt: number;
          startAt: number;
          withMerging: number;
          playlistIds: string;
        };
      };

      status = 200;
      response = await scheduler.updateItem(id, data);
    }

    if (req.method === 'DELETE' && isAuthorizedRequest(req)) {
      const { id } = req.query;

      status = 200;
      response = await scheduler.deleteItem(Number(id));
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
