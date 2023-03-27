import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { DtoCreateCategory } from '@/radio-service/types';
import { isAuthorizedRequest } from '@/radio-service/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { classificator } = getInstance();

    if (req.method === 'GET') {
      status = 200;
      response = await classificator.getCategories();
    }

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      const { name, values } = req.body as DtoCreateCategory;

      status = 200;
      response = await classificator.createCategory({ name, values });
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
