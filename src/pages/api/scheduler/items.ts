import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { scheduler } = getInstance();

    status = 200;
    response = await scheduler.getItems();
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
