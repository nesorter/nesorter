import * as Sentry from '@sentry/node';
import Express from 'express';
import { copyFile, mkdir, rm, writeFile } from 'fs/promises';
import multer from 'multer';
import NodeID3 from 'node-id3';

import { PlaylistsManager } from '@/radio-service/PlaylistsManager';
import { Logger } from '@/radio-service/Storage';
import { Scanner } from '@/radio-service/Streamer';
import { config, withAdminToken, withLogger } from '@/radio-service/utils';

type MulterFile = {
  fieldname: string; //'file_6',
  originalname: string; //'8mb.video-W3O-9lzZ5YYu.mp4',
  encoding: string; //'7bit',
  mimetype: string; //'video/mp4',
  destination: string; //'/tmp',
  filename: string; //'0e5db6097f5a1179aac3eb057252d45a',
  path: string; //'/tmp/0e5db6097f5a1179aac3eb057252d45a',
  size: number; //7677220
};

export const genScannerRoutes = (
  logger: Logger,
  api: Express.Application,
  scanner: Scanner,
  playlistsManager: PlaylistsManager,
) => {
  const upload = multer({ dest: '/tmp' });

  api.post(
    '/api/scanner/upload-files',
    upload.any(),
    withAdminToken(
      withLogger(logger, async (req, res) => {
        try {
          const {
            path,
            newDir,
            shouldCreatePlaylist = '0',
          } = req.body as { path: string; newDir: string; shouldCreatePlaylist?: string };

          if (!path || !newDir) {
            res.status(500).json({ error: 'some fields missed' });
          }

          if (!req.files) {
            res.status(500).json({ error: 'files missed' });
          }

          await mkdir(`${path}${newDir}`, { recursive: true });

          for (const file of req.files as MulterFile[]) {
            await copyFile(file.path, `${path}${newDir}/${file.originalname}`);
            await rm(file.path);
          }

          if (shouldCreatePlaylist === '1') {
            await scanner.syncStorage(
              config.CONTENT_ROOT_DIR_PATH,
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
                await playlistsManager.createQueue(newDir, 'fs', chainItem?.fsItem?.filehash || '');
              }
            } catch (e) {
              console.log(e);
            }
          }

          res.json({ status: 'done' });
        } catch (e) {
          res.status(500).json({ error: e });
        }
      }),
    ),
  );

  api.get(
    '/api/scanner/sync',
    withLogger(logger, (req, res) => {
      scanner
        .syncStorage(
          config.CONTENT_ROOT_DIR_PATH,
          ({ name }) => /.*\.mp3/.test(name) || /.*\.ogg/.test(name),
        )
        .then(() => res.json('ok'))
        .catch((e) => res.status(500).json(e));
    }),
  );

  api.get(
    '/api/scanner/chain',
    withLogger(logger, (req, res) => {
      try {
        const chain = scanner.getChain();
        res.json(chain);
      } catch (e) {
        res.status(500).json(e);
      }
    }),
  );

  api.get(
    '/api/scanner/fsitem/:filehash',
    withLogger(logger, (req, res) => {
      scanner
        .getFsItem(req.params.filehash)
        .then((item) => res.json(item))
        .catch((e) => res.status(500).json(e));
    }),
  );

  api.post(
    '/api/scanner/fsitem/trim/:filehash',
    withAdminToken(
      withLogger(logger, (req, res) => {
        const { start, end } = req.body as { start: number; end: number };
        scanner
          .setTrim(req.params.filehash, start, end)
          .then(() => res.json('ok!'))
          .catch((e) => res.status(500).json(e));
      }),
    ),
  );

  api.get(
    '/api/scanner/plainfile/:filehash',
    withLogger(logger, (req, res) => {
      scanner
        .getFsItem(req.params.filehash)
        .then((item) => res.sendFile(item?.path || ''))
        .catch((e) => res.status(500).json(e));
    }),
  );

  api.get(
    '/api/scanner/image/:filehash',
    withLogger(logger, (req, res) => {
      scanner
        .getFsItem(req.params.filehash)
        .then((item) => {
          NodeID3.Promise.read(item?.path || '')
            .then((data) => {
              if (typeof data.image !== 'string' && typeof data.image !== 'undefined') {
                writeFile(`covers/${item?.filehash}.jpg`, data.image?.imageBuffer || '')
                  .then(() => res.sendFile(`covers/${item?.filehash}.jpg`))
                  .catch(console.log);
              } else {
                res.sendFile(`covers/nocoverart.jpeg`);
              }
            })
            .catch(Sentry.captureException);
        })
        .catch((e) => res.status(500).json(e));
    }),
  );
};
