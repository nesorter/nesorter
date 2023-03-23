import Express from 'express';

import {
  genClassificatorRoutes,
  genLoggerRoutes,
  genPlaylistsManagerRoutes,
  genScannerRoutes,
  genSchedulerRoutes,
  getPlayerRoutes,
} from '@/radio-service/API/routes';
import { Classificator } from '@/radio-service/Classificator';
import { PlaylistsManager, PlaylistsPlayHelper } from '@/radio-service/PlaylistsManager';
import { Queue, Scheduler } from '@/radio-service/Scheduler';
import { Logger } from '@/radio-service/Storage';
import { Scanner, Streamer } from '@/radio-service/Streamer';
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
