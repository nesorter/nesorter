import { ScheduleItem } from '@prisma/client';
import Express from 'express';
import { Logger } from 'lib/Logger';
import { Scheduler } from 'lib/Scheduler';
import { withLogger } from 'lib/utils';

export const gen = (logger: Logger, api: Express.Application, scheduler: Scheduler) => {
  api.get(
    '/api/scheduler/start',
    withLogger(logger, (req, res) => {
      scheduler
        .start()
        .then(() => res.json('ok'))
        .catch((e) => res.status(500).json(e));
    }),
  );

  api.get(
    '/api/scheduler/stop',
    withLogger(logger, (req, res) => {
      try {
        scheduler.stop();
        res.json('ok');
      } catch (e) {
        res.status(500).json(e);
      }
    }),
  );

  api.get(
    '/api/scheduler/items',
    withLogger(logger, (req, res) => {
      scheduler
        .getItems()
        .then((_) => res.json(_))
        .catch((e) => res.status(500).json(e));
    }),
  );

  api.post(
    '/api/scheduler/:id',
    withLogger(logger, (req, res) => {
      const { id, data } = req.body as { id: number; data: Omit<ScheduleItem, 'id'> };

      scheduler
        .updateItem(id, data)
        .then((_) => res.json(_))
        .catch((e) => res.status(500).json(e));
    }),
  );

  api.post(
    '/api/scheduler',
    withLogger(logger, (req, res) => {
      const { start, end, playlistIds } = req.body as {
        start: number;
        end: number;
        playlistIds: string;
      };

      scheduler
        .createItem(start, end, playlistIds)
        .then((_) => res.json(_))
        .catch((e) => res.status(500).json(e));
    }),
  );

  api.delete(
    '/api/scheduler/:id',
    withLogger(logger, (req, res) => {
      const { id } = req.params;

      scheduler
        .deleteItem(Number(id))
        .then((_) => res.json(_))
        .catch((e) => res.status(500).json(e));
    }),
  );
};
