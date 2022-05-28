import Express from 'express';
import { Classificator } from '../../Classificator';

export const gen = (api: Express.Application, classificator: Classificator) => {
  api.route('/api/classificator/categories')
    .get((_req, res) => {
      classificator.getCategories()
        .then((cats) => res.json(cats))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      const { name, values } = req.body as { name: string; values: string[] };

      classificator.addCategory({ name, values })
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    })
    .put((req, res) => {
      const { id, name, values } = req.body as { id: number; name: string; values: string[] };

      classificator.updateCategory({ id, name, values })
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    });

  api.get('/api/classificator/items', (_req, res) => {
    classificator.getItems()
      .then((result) => res.json(result))
      .catch((e) => res.status(500).json(e));
  });

  api.route('/api/classificator/item/:filehash')
    .get((req, res) => {
      classificator.getItem(req.params.filehash)
        .then((result) => res.json(result))
        .catch((e) => res.status(500).json(e));
    })
    .post((req, res) => {
      classificator.updateItem(req.params.filehash, req.body.values)
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    })
    .put((req, res) => {
      classificator.updateItem(req.params.filehash, req.body.values)
        .then((result) => res.json({ result }))
        .catch((e) => res.status(500).json(e));
    });
}
