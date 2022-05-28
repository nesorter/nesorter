import Express from 'express';
import CONFIG from '../../config';
import { Scanner } from '../../Scanner';

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
}
