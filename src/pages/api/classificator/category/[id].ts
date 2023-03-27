import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { DtoUpsertCategory } from '@/radio-service/types';
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
      const { id, name, values } = req.body as DtoUpsertCategory;

      status = 200;
      response = await classificator.upsertCategory({ id, name, values });
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
