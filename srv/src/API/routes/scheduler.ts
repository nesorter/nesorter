import Express from 'express';
import { Logger } from "../../Logger";
import { Scheduler } from "../../Scheduler";
import { withLogger } from '../../utils';

export const gen = (logger: Logger, api: Express.Application, scheduler: Scheduler) => {
  api.get('/api/scheduler/start', withLogger(logger, (req, res) => {
    scheduler.start()
      .then(() => res.json('ok'))
      .catch((e) => res.status(500).json(e));
  }));

  api.get('/api/scheduler/stop', withLogger(logger, (req, res) => {
    scheduler.stop()
      .then(() => res.json('ok'))
      .catch((e) => res.status(500).json(e));
  }));

  api.get('/api/scheduler/items', withLogger(logger, (req, res) => {
    scheduler.getItems()
      .then((_) => res.json(_))
      .catch((e) => res.status(500).json(e));
  }));

  api.post('/api/scheduler', withLogger(logger, async (req, res) => {
    const { start, end, playlistId } = req.body as { start: number; end: number; playlistId: number };

    scheduler.createItem(start, end, Number(playlistId))
      .then((_) => res.json(_))
      .catch((e) => res.status(500).json(e));
  }));

  api.delete('/api/scheduler/:id', withLogger(logger, async (req, res) => {
    const { id } = req.params;

    scheduler.deleteItem(Number(id))
      .then((_) => res.json(_))
      .catch((e) => res.status(500).json(e));
  }));
};