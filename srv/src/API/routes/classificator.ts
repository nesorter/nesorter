import Express from 'express';
import { Classificator } from '../../Classificator';
import { Logger } from '../../Logger';
import { LogLevel, LogTags } from '../../Logger/types';

export const gen = (logger: Logger, api: Express.Application, classificator: Classificator) => {
  api.route('/api/classificator/categories')
    .get((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      classificator.getCategories()
        .then((cats) => res.json(cats))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      const { name, values } = req.body as { name: string; values: string[] };

      classificator.addCategory({ name, values })
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    })
    .put((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      const { id, name, values } = req.body as { id: number; name: string; values: string[] };

      classificator.updateCategory({ id, name, values })
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    });

  api.get('/api/classificator/items', (req, res) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    classificator.getItems()
      .then((result) => res.json(result))
      .catch((e) => res.status(500).json(e));
  });

  api.route('/api/classificator/item/:filehash')
    .get((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      classificator.getItem(req.params.filehash)
        .then((result) => res.json(result))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      classificator.updateItem(req.params.filehash, req.body.categories)
        .then((result) => res.json({ result }))
        .catch((e) => {
          logger.log({ message: `Failed update track categories: ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
          res.status(500).json(e);
        });
    })
    .put((req, res) => {
      logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
      classificator.updateItem(req.params.filehash, req.body.categories)
        .then((result) => res.json({ result }))
        .catch((e) => {
          logger.log({ message: `Failed update track categories: ${e}`, level: LogLevel.ERROR, tags: [LogTags.API] });
          res.status(500).json(e);
        });
    });
}
