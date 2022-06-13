import Express from 'express';
import CONFIG from '../../config';
import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger/types';
import { Scanner } from '../../Scanner';
import { getWaveformInfo } from '../../utils';

export const gen = (logger: Logger, api: Express.Application, scanner: Scanner) => {
  api.get('/api/scanner/sync', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    scanner.syncStorage(CONFIG.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))
      .then(() => res.json('ok'))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scanner/chain', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    scanner.getChain()
      .then((chain) => res.json(chain))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scanner/waveform/:filehash', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    scanner.getFsItem(req.params.filehash)
      .then((item) => getWaveformInfo(item?.path || ''))
      .then((waveform) => res.json(waveform))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scanner/plainfile/:filehash', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    scanner.getFsItem(req.params.filehash)
      .then((item) => res.sendFile(item?.path || ''))
      .catch((e) => res.status(500).json(e));
  })
}
