import Express from 'express';

import { Scheduler } from '@/radio-service/Scheduler';
import { Logger } from '@/radio-service/Storage';
import { withAdminToken, withLogger } from '@/radio-service/utils';

export const genSchedulerRoutes = (
  logger: Logger,
  api: Express.Application,
  scheduler: Scheduler,
) => {
  api.get(
    '/api/scheduler/start',
    withAdminToken(
      withLogger(logger, (req, res) => {
        scheduler
          .start()
          .then(() => res.json('ok'))
          .catch((e) => res.status(500).json(e));
      }),
    ),
  );

  api.get(
    '/api/scheduler/stop',
    withAdminToken(
      withLogger(logger, (req, res) => {
        try {
          scheduler.stop();
          res.json('ok');
        } catch (e) {
          res.status(500).json(e);
        }
      }),
    ),
  );

  api.get(
    '/api/scheduler/items',
    withAdminToken(
      withLogger(logger, (req, res) => {
        scheduler
          .getItems()
          .then((_) => res.json(_))
          .catch((e) => res.status(500).json(e));
      }),
    ),
  );

  api.post(
    '/api/scheduler/:id',
    withAdminToken(
      withLogger(logger, (req, res) => {
        const { id, data } = req.body as {
          id: number;
          data: {
            name: string;
            endAt: number;
            startAt: number;
            withMerging: number;
            playlistIds: string;
          };
        };

        scheduler
          .updateItem(id, data)
          .then((_) => res.json(_))
          .catch((e) => res.status(500).json(e));
      }),
    ),
  );

  api.post(
    '/api/scheduler',
    withAdminToken(
      withLogger(logger, (req, res) => {
        const { name, start, end, playlistIds, withMerging } = req.body as {
          name: string;
          start: number;
          end: number;
          playlistIds: string;
          withMerging?: number;
        };

        scheduler
          .createItem(name, start, end, playlistIds, withMerging)
          .then((_) => res.json(_))
          .catch((e) => res.status(500).json(e));
      }),
    ),
  );

  api.delete(
    '/api/scheduler/:id',
    withAdminToken(
      withLogger(logger, (req, res) => {
        const { id } = req.params;

        scheduler
          .deleteItem(Number(id))
          .then((_) => res.json(_))
          .catch((e) => res.status(500).json(e));
      }),
    ),
  );
};
