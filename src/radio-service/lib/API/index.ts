import Express from 'express';

import { gen as genClassificatorRoutes } from '@/radio-service/lib/API/routes/classificator';
import { gen as genLoggerRoutes } from '@/radio-service/lib/API/routes/logger';
import { gen as getPlayerRoutes } from '@/radio-service/lib/API/routes/player';
import { gen as genPlaylistsManagerRoutes } from '@/radio-service/lib/API/routes/playlistsManager';
import { gen as genScannerRoutes } from '@/radio-service/lib/API/routes/scanner';
import { gen as genSchedulerRoutes } from '@/radio-service/lib/API/routes/scheduler';
import { Classificator } from '@/radio-service/lib/Classificator';
import { Logger } from '@/radio-service/lib/Logger';
import { PlaylistsManager } from '@/radio-service/lib/PlaylistsManager';
import { PlaylistsPlayHelper } from '@/radio-service/lib/PlaylistsPlayHelper';
import { Queue } from '@/radio-service/lib/Queue';
import { Scanner } from '@/radio-service/lib/Scanner';
import { Scheduler } from '@/radio-service/lib/Scheduler';
import { Streamer } from '@/radio-service/lib/Streamer';
import { LogLevel, LogTags, StorageType } from '@/radio-service/types';
import { config } from '@/radio-service/utils';

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
    genScannerRoutes(this.logger, this.router, this.scanner, this.playlistsManager);
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
