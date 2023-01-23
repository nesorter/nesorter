import Express from 'express';

import { Classificator } from '../../Classificator';
import { ClassificationCategory } from '../../Classificator.types';
import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger.types';
import { withLogger } from '../../utils';

export const gen = (logger: Logger, api: Express.Application, classificator: Classificator) => {
  api
    .route('/api/classificator/categories')
    .get(
      withLogger(logger, (req, res) => {
        classificator
          .getCategories()
          .then((cats) => res.json(cats))
          .catch((e) => res.status(500).json(e));
      }),
    )
    .post(
      withLogger(logger, (req, res) => {
        const { name, values } = req.body as { name: string; values: string[] };

        classificator
          .addCategory({ name, values })
          .then((result) => res.json({ result }))
          .catch((e) => res.status(500).json(e));
      }),
    )
    .put(
      withLogger(logger, (req, res) => {
        const { id, name, values } = req.body as { id: number; name: string; values: string[] };

        classificator
          .updateCategory({ id, name, values })
          .then((result) => res.json({ result }))
          .catch((e) => res.status(500).json(e));
      }),
    );

  api.get(
    '/api/classificator/items',
    withLogger(logger, (req, res) => {
      const filters = req.query?.filters as Record<string, string | string[]>;

      classificator
        .getItems(filters)
        .then((result) => res.json(result))
        .catch((e) => {
          logger.log({
            message: `Failed to get items: ${e}`,
            level: LogLevel.ERROR,
            tags: [LogTags.API],
          });
          res.status(500).json(e);
        });
    }),
  );

  api
    .route('/api/classificator/item/:filehash')
    .get(
      withLogger(logger, (req, res) => {
        classificator
          .getItem(req.params.filehash)
          .then((result) => res.json(result))
          .catch((e) => res.status(500).json(e));
      }),
    )
    .post(
      withLogger(logger, (req, res) => {
        classificator
          .updateItem(
            req.params.filehash,
            (req.body as { categories: ClassificationCategory[] }).categories,
          )
          .then((result) => res.json({ result }))
          .catch((e) => {
            logger.log({
              message: `Failed update track categories: ${e}`,
              level: LogLevel.ERROR,
              tags: [LogTags.API],
            });
            res.status(500).json(e);
          });
      }),
    )
    .put(
      withLogger(logger, (req, res) => {
        classificator
          .updateItem(
            req.params.filehash,
            (req.body as { categories: ClassificationCategory[] }).categories,
          )
          .then((result) => res.json({ result }))
          .catch((e) => {
            logger.log({
              message: `Failed update track categories: ${e}`,
              level: LogLevel.ERROR,
              tags: [LogTags.API],
            });
            res.status(500).json(e);
          });
      }),
    );
};
