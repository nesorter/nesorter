import Express from 'express';

import { Logger } from '../../Logger';
import { withAdminToken, withLogger } from '../../utils';

export const gen = (logger: Logger, api: Express.Application) => {
  api
    .route('/api/classificator/categories')
    .get(
      withLogger(logger, (req, res) => {
        res.status(500).json({ error: 'not implemented' });
      }),
    )
    .post(
      withAdminToken(
        withLogger(logger, (req, res) => {
          res.status(500).json({ error: 'not implemented' });
        }),
      ),
    )
    .put(
      withAdminToken(
        withLogger(logger, (req, res) => {
          res.status(500).json({ error: 'not implemented' });
        }),
      ),
    );

  api.get(
    '/api/classificator/items',
    withLogger(logger, (req, res) => {
      res.status(500).json({ error: 'not implemented' });
    }),
  );

  api
    .route('/api/classificator/item/:filehash')
    .get(
      withLogger(logger, (req, res) => {
        res.status(500).json({ error: 'not implemented' });
      }),
    )
    .post(
      withAdminToken(
        withLogger(logger, (req, res) => {
          res.status(500).json({ error: 'not implemented' });
        }),
      ),
    )
    .put(
      withAdminToken(
        withLogger(logger, (req, res) => {
          res.status(500).json({ error: 'not implemented' });
        }),
      ),
    );
};
