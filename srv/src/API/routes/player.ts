import Express from 'express';
import { Logger } from '../../Logger';
import { withLogger } from '../../utils';
import { Queue } from '../../Queue';

export const gen = (logger: Logger, api: Express.Application, queue: Queue) => {
  api.post('/api/player/play', withLogger(logger, (_req, res) => {
    try {
      queue.play();
      res.status(200).json({ message: 'started' });
    } catch (e) {
      res.status(500).json(e);
    }
  }));

  api.post('/api/player/stop', withLogger(logger, (_req, res) => {
    try {
      queue.stop();
      res.status(200).json({ message: 'stopped' });
    } catch (e) {
      res.status(500).json(e);
    }
  }));
}
