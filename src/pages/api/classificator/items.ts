import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { classificator } = getInstance();

    if (req.method === 'GET') {
      status = 200;
      response = await classificator.getFileItems();
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
