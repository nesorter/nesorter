import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { DtoUpsertFileItem } from '@/radio-service/types';
import { isAuthorizedRequest } from '@/radio-service/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { classificator } = getInstance();

    if (req.method === 'GET') {
      status = 200;
      response = await classificator.getFileItem(String(req.query.filehash));
    }

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      const { filehash, classItemsIds } = req.body as DtoUpsertFileItem;

      status = 200;
      response = await classificator.upsertFileItem({ filehash, classItemsIds });
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
