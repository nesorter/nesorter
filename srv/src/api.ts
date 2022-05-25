import Scanner from "./scanner";
import Express from 'express';
import Classificator, { ClassificationCategory } from "./classificator";
import { object, string, array } from 'yup';
import DBStorage from "./storage";
import NodeID3 from 'node-id3';
import { getQueue, getWaveformInfo } from "./utils";
import { Streamer } from "./streamer";

type AddItemPayload = {
  name: string;
  categories: ClassificationCategory[];
}

type AddQueuePayload = {
  id: string;
  name: string;
}

type AddToQueuePayload = {
  id: string;
  filename: string;
}

export default function createApi(
  scanner: Scanner,
  classificator: Classificator,
  storage: DBStorage
): Express.Application {
  const app = Express();
  const streamer = new Streamer();

  const updCategoryValidator = array()
    .of(object({
      name: string().required(),
      values: array().of(string()),
    }))
    .required();

  const addItemValidator = object({
    name: string().required(),
    categories: array()
      .of(object({
        name: string().required(),
        values: array().of(string()),
      }))
      .required(),
  });

  const addQueuePayload = object({
    id: string().required(),
    name: string().required(),
  });

  const addToQueuePayload = object({
    id: string().required(),
    filename: string().required(),
  });

  app.use(Express.json());

  app.post('/api/test', async (req, res) => {
    const item = scanner.finded.find((i) => i.name === req.body.filename);

    if (item) {
      await streamer.runPlaylist([item.path]);
      res.json('ok');
    } else {
      res.status(404).json({ message: 'no files for this name 🫣' });
    }
  });

  app.post('/api/queue/stream', async (req, res) => {
    if (req.query.queueId) {
      const queue = await getQueue((req.query.queueId || '').toString(), storage);
      await streamer.runPlaylist(
        (await queue.getQueue()).map(i => i.filePath),
        `${process.cwd()}/${req.query.queueId}.txt`,
      );
      res.json('ok');
    } else {
      res.status(404).json({ message: 'no files for this name 🫣' });
    }
  });

  app.get('/api/queue', async (_req, res) => {
    const queue = await getQueue((_req.query.id || '').toString(), storage);
    res.json(await queue.getQueue());
  });

  app.get('/api/queues', (_req, res) => {
    res.json(storage.storage.queueList);
  });

  app.post('/api/createQueue', async (req, res) => {
    const body = req.body as AddQueuePayload;
    const validationResult = await addQueuePayload.isValid(req.body);

    if (!validationResult) {
      res.status(422).json({ message: 'payload is not valid 🤬' });
      return;
    }

    const queue = await getQueue(body.id, storage, body.name);
    res.status(200).json({ message: 'created 🤘🏻', queue });
  });

  app.post('/api/addInQueue', async (req, res) => {
    const body = req.body as AddToQueuePayload;
    const validationResult = await addToQueuePayload.isValid(req.body);

    if (!validationResult) {
      res.status(422).json({ message: 'payload is not valid 🤬' });
      return;
    }

    const queue = await getQueue(body.id, storage);
    const item = scanner.finded.find(i => i.name === body.filename);

    await queue.addInQueue(item?.path || '');

    res.status(200).json({ message: 'created 🤘🏻' });
  })

  app.get('/api/items', (_req, res) => {
    res.json(scanner.finded);
  });

  app.get('/api/items/chain', (_req, res) => {
    res.json(scanner.chain);
  });

  app.get('/api/categories', (_req, res) => {
    res.json(classificator.categories);
  });

  app.get('/api/completed', (_req, res) => {
    res.json(storage.storage || {});
  });

  app.post('/api/add', async (req, res) => {
    const body = req.body as AddItemPayload;
    const validationResult = await addItemValidator.isValid(req.body);

    if (!validationResult) {
      res.status(422).json({ message: 'payload is not valid 🤬' });
      return;
    }

    classificator.addItem(body.name, body.categories);
    res.status(200).json({ message: 'updated 🤘🏻' });
  });

  app.post('/api/update_cats', async (req, res) => {
    const body = req.body as AddItemPayload['categories'];
    const validationResult = await updCategoryValidator.isValid(req.body);

    if (!validationResult) {
      res.status(422).json({ message: 'payload is not valid 🤬' });
      return;
    }

    classificator.updateCategories(body);
    res.status(200).json({ message: 'updated 🤘🏻' });
  });

  app.get('/api/fileinfo', async (req, res) => {
    const filename = req.query.name;
    const item = scanner.finded.find(i => i.name === filename);

    console.log(req.query);

    if (item) {
      let waveform;
      let tags: NodeID3.Tags | undefined;
      let classification;

      try {
        tags = await NodeID3.Promise.read(item.path);
      } catch (e) {
        console.log('ERROR: unable to get tags: ', e);
      }

      try {
        waveform = await getWaveformInfo(item.path);
      } catch (e) {
        console.log('ERROR: unable to get waveform: ', e);
      }

      try {
        classification = await classificator.getItem(item.name);
      } catch (e) {
        console.log('ERROR: unable to get classification: ', e);
      }

      res.json({ tags: { artist: tags?.artist, title: tags?.title }, classification, waveform });
    } else {
      res.status(404).json({ message: 'no files for this name 🫣' });
    }
  });

  app.get('/api/files', async (req, res) => {
    const filters = req.query.filters as unknown as Record<string, string[]> || {};
    const asCategories: ClassificationCategory[] = Object.entries(filters).map(([name, values]) => ({ name, values }));
    const classificated = await classificator.getItems(asCategories);

    res.json(classificated);
  });

  app.get('/api/file', async (req, res) => {
    const filename = req.query.name;
    const item = scanner.finded.find(i => i.name === filename);

    if (item) {
      res.sendFile(item?.path);
    } else {
      res.status(404).json({ message: 'no files for this name 🫣' });
    }
  });

  return app;
}
