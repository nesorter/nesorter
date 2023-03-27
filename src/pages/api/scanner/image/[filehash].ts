import * as fs from 'fs';
import { stat, writeFile } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import NodeID3 from 'node-id3';
import path from 'path';

import { getInstance } from '@/radio-service';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    const { scanner } = getInstance();

    const fileItem = await scanner.getFsItem(String(req.query.filehash));
    let filePath = path.resolve(`covers/${fileItem?.filehash}.jpg`);

    try {
      await stat(filePath);
    } catch {
      const data = await NodeID3.Promise.read(fileItem?.path || '');
      const imageExist = typeof data.image !== 'string' && typeof data.image !== 'undefined';

      if (imageExist) {
        try {
          await writeFile(filePath, (data?.image as { imageBuffer: Buffer })?.imageBuffer || '');
        } catch {
          filePath = path.resolve(`covers/nocoverart.jpeg`);
        }
      } else {
        filePath = path.resolve(`covers/nocoverart.jpeg`);
      }
    }

    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.status(200).send(fileBuffer);
  } catch (e) {
    status = 500;
    response = e;
    res.status(status).json(response);
  }
}
