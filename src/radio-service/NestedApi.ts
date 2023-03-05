import Express from 'express';

export class NestedApi {
  api: Express.Application;

  constructor() {
    this.api = Express();
    this.api.use(Express.json());
  }

  listen(port = 3000) {
    this.api.listen(port, () => {
      console.log(`NestedApi: Start listening at ${port}`);
    });
  }

  bindRoutes() {
    this.api.get('/data', (req, res) => {
      res.json({ message: 'Hello, world!' });
    });
  }
}
