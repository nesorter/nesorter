import Express from 'express';
import { writeFile } from 'fs/promises';
import NodeID3 from 'node-id3';

import config from '../../config';
import { Logger } from '../../Logger';
import { Scanner } from '../../Scanner';
import { getWaveformInfo, withLogger } from '../../utils';

export const gen = (logger: Logger, api: Express.Application, scanner: Scanner) => {
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
    '/api/scanner/waveform/:filehash',
    withLogger(logger, (req, res) => {
      scanner
        .getFsItem(req.params.filehash)
        .then((item) => getWaveformInfo(logger, item?.path || ''))
        .then((waveform) => res.json(waveform))
        .catch((e) => res.status(500).json(e));
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
    withLogger(logger, (req, res) => {
      const { start, end } = req.body as { start: number; end: number };
      scanner
        .setTrim(req.params.filehash, start, end)
        .then(() => res.json('ok!'))
        .catch((e) => res.status(500).json(e));
    }),
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
          NodeID3.Promise.read(item?.path || '').then((data) => {
            if (typeof data.image !== 'string' && typeof data.image !== 'undefined') {
              writeFile(
                `${__dirname}/assets/covers/${item?.filehash}.jpg`,
                data.image?.imageBuffer || '',
              ).then(() => {
                res.sendFile(`${__dirname}/assets/covers/${item?.filehash}.jpg`);
              });
            } else {
              res.sendFile(`${__dirname}/assets/covers/nocoverart.jpeg`);
            }
          });
        })
        .catch((e) => res.status(500).json(e));
    }),
  );
};
