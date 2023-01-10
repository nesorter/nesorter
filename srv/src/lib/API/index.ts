import Express from 'express';
import config from 'lib/config';

import { Classificator } from 'lib/Classificator';
import { Logger } from 'lib/Logger';
import { LogLevel, LogTags } from 'lib/Logger.types';
import { PlaylistsManager } from 'lib/PlaylistsManager';
import { Scanner } from 'lib/Scanner';
import { StorageType } from 'lib/Storage';
import { Streamer } from 'lib/Streamer';
import { Scheduler } from 'lib/Scheduler';
import { Queue } from 'lib/Queue';
import { PlaylistsPlayHelper } from 'lib/PlaylistsPlayHelper';

import { gen as genScannerRoutes } from 'lib/API/routes/scanner';
import { gen as genLoggerRoutes } from 'lib/API/routes/logger';
import { gen as genClassificatorRoutes } from 'lib/API/routes/classificator';
import { gen as genPLaylistsManagerRoutes } from 'lib/API/routes/playlistsManager';
import { gen as genSchedulerRoutes } from 'lib/API/routes/scheduler';
import { gen as getPlayerRoutes } from 'lib/API/routes/player';

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
    private queue: Queue,
    private playHelper: PlaylistsPlayHelper,
  ) {
    this.router = Express();
    this.router.use(Express.json());
  }

  bindRoutes(): API {
    genLoggerRoutes(this.router, this.logger, this.streamer, this.scanner, this.scheduler, this.queue);
    genClassificatorRoutes(this.logger, this.router, this.classificator);
    genPLaylistsManagerRoutes(this.logger, this.router, this.playlistsManager, this.streamer, this.db);
    genScannerRoutes(this.logger, this.router, this.scanner);
    genSchedulerRoutes(this.logger, this.router, this.scheduler);
    getPlayerRoutes(this.logger, this.router, this.queue, this.playHelper);

    return this;
  }

  start(): void {
    this.router.listen(config.API_LISTEN_PORT, () => this.logger.log({
      message: `Server start listening on ${config.API_LISTEN_PORT}`,
      level: LogLevel.INFO,
      tags: [LogTags.APP],
    }));
  }
}
