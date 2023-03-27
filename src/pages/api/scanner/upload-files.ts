import { Fields, Files, formidable, Options } from 'formidable';
import { copyFile, mkdir, rm } from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';
import { config as cfg } from '@/radio-service/utils';
import { isAuthorizedRequest } from '@/radio-service/utils';

export function processRequestWithFormidable(
  req: NextApiRequest,
  opts?: Options,
): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    formidable(opts).parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      return resolve({ fields, files });
    });
  });
}

const formidableConfig: Options = {
  keepExtensions: true,
  maxFileSize: 500_000_000_0,
  maxFieldsSize: 500_000_000_0,
  maxFields: 500,
  allowEmptyFiles: true,
  multiples: true,
  uploadDir: '/tmp',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' || !isAuthorizedRequest(req)) {
    res.status(403).send({ message: 'Invalid request' });
    return;
  }

  try {
    const { scanner, playlistsManager } = getInstance();
    const { fields, files } = await processRequestWithFormidable(req, formidableConfig);
    const { path, newDir, shouldCreatePlaylist = '0' } = fields;

    await mkdir(`${path}${newDir}`, { recursive: true });
    for (const file of Object.values(files)) {
      if (file instanceof Array) {
        for (const subFile of file) {
          await copyFile(subFile.filepath, `${path}${newDir}/${subFile.originalFilename}`);
          await rm(subFile.filepath);
        }
      } else {
        await copyFile(file.filepath, `${path}${newDir}/${file.originalFilename}`);
        await rm(file.filepath);
      }
    }

    if (shouldCreatePlaylist === '1') {
      await scanner.syncStorage(
        cfg.CONTENT_ROOT_DIR_PATH,
        ({ name }) => /.*\.mp3/.test(name) || /.*\.ogg/.test(name),
      );
      const chainItems = Object.values(scanner.getChain());
      const chainItem = chainItems.find((_) => _.fsItem?.path === `${path}${newDir}`);

      console.dir({
        path: `${path}${newDir}`,
        items: chainItems.filter((_) => _.fsItem?.type === 'dir').map((_) => _.fsItem),
        chainItem,
      });

      try {
        if (chainItem) {
          await playlistsManager.createQueue(
            String(newDir),
            'fs',
            chainItem?.fsItem?.filehash || '',
          );
        }
      } catch (e) {
        console.log(e);
      }
    }

    res.status(200).send({ message: 'uploaded' });
  } catch (e) {
    res.status(500).send(e);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
