import Express from 'express';
import CONFIG from '../../config';
import { Scanner } from '../../Scanner';
import { getWaveformInfo } from '../../utils';

export const gen = (api: Express.Application, scanner: Scanner) => {
  api.post('/api/scanner/sync', (_req, res) => {
    scanner.syncStorage(CONFIG.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))
      .then(() => res.json('ok'))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scanner/chain', (_req, res) => {
    scanner.getChain()
      .then((chain) => res.json(chain))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scanner/waveform/:filehash', (req, res) => {
    scanner.getFsItem(req.params.filehash)
      .then((item) => getWaveformInfo(item?.path || ''))
      .then((waveform) => res.json(waveform))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scanner/plainfile/:filehash', (req, res) => {
    scanner.getFsItem(req.params.filehash)
      .then((item) => res.sendFile(item?.path || ''))
      .catch((e) => res.status(500).json(e));
  })
}
