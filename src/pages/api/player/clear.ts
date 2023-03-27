import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { isAuthorizedRequest } from '@/radio-service/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { queue } = getInstance();

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      queue.clear();
      status = 200;
      response = { message: 'cleared' };
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
