import Express from 'express';
import { Logger } from '../../Logger';

export const gen = (api: Express.Application, logger: Logger) => {
  api.get('/api/logger', (_req, res) => {
    logger.getLogs()
      .then((logs) => res.json(logs))
      .catch((e) => res.status(500).json(e));
  });
}
