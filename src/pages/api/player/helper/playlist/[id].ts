import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { isAuthorizedRequest } from '@/radio-service/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { playHelper } = getInstance();

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      const { id } = req.query as { id: string };
      await playHelper.queuePlaylist(Number(id));
      status = 200;
      response = { message: 'queued' };
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
