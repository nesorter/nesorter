import Express from 'express';
import { Logger } from "../../Logger";
import { LogLevel, LogTags } from '../../Logger/types';
import { Scheduler } from "../../Scheduler";

export const gen = (logger: Logger, api: Express.Application, scheduler: Scheduler) => {
  api.get('/api/scheduler/start', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });

    scheduler.start()
      .then(() => res.json('ok'))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scheduler/stop', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });

    scheduler.stop()
      .then(() => res.json('ok'))
      .catch((e) => res.status(500).json(e));
  });

  api.get('/api/scheduler/items', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });

    scheduler.getItems()
      .then((_) => res.json(_))
      .catch((e) => res.status(500).json(e));
  });

  api.post('/api/scheduler', async (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });

    const { start, end, playlistId } = req.body as { start: number; end: number; playlistId: number };

    scheduler.createItem(start, end, Number(playlistId))
      .then((_) => res.json(_))
      .catch((e) => res.status(500).json(e));
  });

  api.delete('/api/scheduler/:id', async (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });

    const { id } = req.params;

    scheduler.deleteItem(Number(id))
      .then((_) => res.json(_))
      .catch((e) => res.status(500).json(e));
  });
};