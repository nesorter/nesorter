import Express from 'express';

import {
  DtoCreateCategory,
  DtoUpsertCategory,
  DtoUpsertFileItem,
} from '@/radio-service/types/ApisDtos';

import { Classificator } from '../../Classificator';
import { Logger } from '../../Logger';
import { withAdminToken, withLogger } from '../../utils';

export const gen = (logger: Logger, api: Express.Application, classificator: Classificator) => {
  api
    .route('/api/classificator/categories')
    .get(
      withLogger(logger, (req, res) => {
        classificator
          .getCategories()
          .then((result) => res.json(result))
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          .catch((err) => res.status(500).json({ error: err }));
      }),
    )
    .post(
      withAdminToken(
        withLogger(logger, (req, res) => {
          const { name, values } = req.body as DtoCreateCategory;
          classificator
            .createCategory({ name, values })
            .then((result) => res.json(result))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .catch((err) => res.status(500).json({ error: err }));
        }),
      ),
    );

  api.route('/api/classificator/category/:id').post(
    withAdminToken(
      withLogger(logger, (req, res) => {
        const { id, name, values } = req.body as DtoUpsertCategory;
        classificator
          .upsertCategory({ id, name, values })
          .then((result) => res.json(result))
          .catch((err) => {
            console.log(err);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            res.status(500).json({ error: err });
          });
      }),
    ),
  );

  api.get(
    '/api/classificator/items',
    withLogger(logger, (req, res) => {
      classificator
        .getFileItems()
        .then((result) => res.json(result))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        .catch((err) => res.status(500).json({ error: err }));
    }),
  );

  api
    .route('/api/classificator/item/:filehash')
    .get(
      withLogger(logger, (req, res) => {
        classificator
          .getFileItem(req.params.filehash)
          .then((result) => res.json(result))
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          .catch((err) => res.status(500).json({ error: err }));
      }),
    )
    .post(
      withAdminToken(
        withLogger(logger, (req, res) => {
          const { filehash, classItemsIds } = req.body as DtoUpsertFileItem;
          classificator
            .upsertFileItem({ filehash, classItemsIds })
            .then((result) => res.json(result))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .catch((err) => res.status(500).json({ error: err }));
        }),
      ),
    )
    .put(
      withAdminToken(
        withLogger(logger, (req, res) => {
          const { filehash, classItemsIds } = req.body as DtoUpsertFileItem;
          classificator
            .upsertFileItem({ filehash, classItemsIds })
            .then((result) => res.json(result))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .catch((err) => res.status(500).json({ error: err }));
        }),
      ),
    );
};
