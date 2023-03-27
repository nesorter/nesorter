import * as fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { scanner } = getInstance();

    const fileItem = await scanner.getFsItem(String(req.query.filehash));
    const filePath = fileItem?.path || '';
    const fileBuffer = fs.readFileSync(filePath);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(fileBuffer);
  } catch (e) {
    status = 500;
    response = e;
    res.status(status).json(response);
  }
}
