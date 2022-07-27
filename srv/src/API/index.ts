import Express from 'express';
import CONFIG from '../config';

import { Classificator } from '../Classificator';
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger/types';
import { PlaylistsManager } from '../PlaylistsManager';
import { Scanner } from '../Scanner';
import { StorageType } from '../Storage';
import { Streamer } from '../Streamer';
import { Scheduler } from '../Scheduler';

import { gen as genScannerRoutes } from './routes/scanner';
import { gen as genLoggerRoutes } from './routes/logger';
import { gen as genClassificatorRoutes } from './routes/classificator';
import { gen as genPLaylistsManagerRoutes } from './routes/playlistsManager';
import { gen as genSchedulerRoutes } from './routes/scheduler';


/**
 * Класс гигачад
 */
export class API {
  router: Express.Application;

  constructor(
    private db: StorageType,
    private logger: Logger,
    private scanner: Scanner,
    private classificator: Classificator,
    private playlistsManager: PlaylistsManager,
    private streamer: Streamer,
    private scheduler: Scheduler,
  ) {
    this.router = Express();
    this.router.use(Express.json());
  }

  bindRoutes(): API {
    genLoggerRoutes(this.router, this.logger, this.streamer, this.scanner, this.scheduler);
    genClassificatorRoutes(this.logger, this.router, this.classificator);
    genPLaylistsManagerRoutes(this.logger, this.router, this.playlistsManager, this.streamer, this.db);
    genScannerRoutes(this.logger, this.router, this.scanner);
    genSchedulerRoutes(this.logger, this.router, this.scheduler);

    return this;
  }

  start(): void {
    this.router.listen(CONFIG.API_LISTEN_PORT, () => this.logger.log({
      message: `Server start listening on ${CONFIG.API_LISTEN_PORT}`,
      level: LogLevel.INFO,
      tags: [LogTags.APP],
    }));
  }
}
