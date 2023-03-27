import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { config, isAuthorizedRequest } from '@/radio-service/utils';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { scanner } = getInstance();

    if (req.method === 'POST' && isAuthorizedRequest(req)) {
      await scanner.syncStorage(
        config.CONTENT_ROOT_DIR_PATH,
        ({ name }) => /.*\.mp3/.test(name) || /.*\.ogg/.test(name),
      );
      status = 200;
      response = { message: 'synced' };
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
