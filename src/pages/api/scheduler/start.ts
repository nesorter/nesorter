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
      await scheduler.start();
      status = 200;
      response = { message: 'started' };
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
