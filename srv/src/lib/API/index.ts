import Express from 'express';

import { Classificator } from '../Classificator';
import config from '../config';
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger.types';
import { PlaylistsManager } from '../PlaylistsManager';
import { PlaylistsPlayHelper } from '../PlaylistsPlayHelper';
import { Queue } from '../Queue';
import { Scanner } from '../Scanner';
import { Scheduler } from '../Scheduler';
import { StorageType } from '../Storage';
import { Streamer } from '../Streamer';
import { gen as genClassificatorRoutes } from './routes/classificator';
import { gen as genLoggerRoutes } from './routes/logger';
import { gen as getPlayerRoutes } from './routes/player';
import { gen as genPlaylistsManagerRoutes } from './routes/playlistsManager';
import { gen as genScannerRoutes } from './routes/scanner';
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
    private playlistsManager: PlaylistsManager,
    private streamer: Streamer,
    private scheduler: Scheduler,
    private queue: Queue,
    private playHelper: PlaylistsPlayHelper,
    private classificator: Classificator,
  ) {
    this.router = Express();
    this.router.use(Express.json());
  }

  bindRoutes(): API {
    genLoggerRoutes(
      this.router,
      this.logger,
      this.streamer,
      this.scanner,
      this.scheduler,
      this.queue,
    );
    genClassificatorRoutes(this.logger, this.router, this.classificator);
    genPlaylistsManagerRoutes(
      this.logger,
      this.router,
      this.playlistsManager,
      this.streamer,
      this.db,
    );
    genScannerRoutes(this.logger, this.router, this.scanner);
    genSchedulerRoutes(this.logger, this.router, this.scheduler);
    getPlayerRoutes(this.logger, this.router, this.queue, this.playHelper);

    return this;
  }

  start(): void {
    this.router.listen(config.API_LISTEN_PORT, () =>
      this.logger.log({
        message: `Server start listening on ${config.API_LISTEN_PORT}`,
        level: LogLevel.INFO,
        tags: [LogTags.APP],
      }),
    );
  }
}
