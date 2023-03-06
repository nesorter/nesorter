import * as Sentry from '@sentry/node';

import { API } from './lib/API';
import { Classificator } from './lib/Classificator';
import config from './lib/config';
import { Logger } from './lib/Logger';
import { LogLevel, LogTags } from './lib/Logger.types';
import { Player } from './lib/Player';
import { PlaylistsManager } from './lib/PlaylistsManager';
import { PlaylistsPlayHelper } from './lib/PlaylistsPlayHelper';
import { Publisher } from './lib/Publisher';
import { Queue } from './lib/Queue';
import { Scanner } from './lib/Scanner';
import { Scheduler } from './lib/Scheduler';
import { Storage } from './lib/Storage';
import { Streamer } from './lib/Streamer';

export type RadioServiceModule = ReturnType<typeof createRadioServiceModule>;
export const createRadioServiceModule = () => {
  const logger = new Logger();
  const classificator = new Classificator(Storage);
  const scanner = new Scanner(Storage, logger, onScanned);
  const playlistsManager = new PlaylistsManager(Storage, logger, scanner);
  const streamer = new Streamer(logger, scanner);
  const publisher = new Publisher(logger);
  const player = new Player(logger);
  const queue = new Queue(Storage, player, publisher);
  const scheduler = new Scheduler(Storage, logger, queue, playlistsManager);
  const playHelper = new PlaylistsPlayHelper(Storage, queue, playlistsManager);
  const api = new API(
    Storage,
    logger,
    scanner,
    playlistsManager,
    streamer,
    scheduler,
    queue,
    playHelper,
    classificator,
  );

  const init = () => {
    api.bindRoutes().start();

    if (config.SENTRY_DSN) {
      Sentry.init({ dsn: config.SENTRY_DSN });
      Sentry.captureMessage('Radio service started');
    }
  };

  function onScanned() {
    logger.log({
      message: `Scan completed. Starting cache warming!`,
      level: LogLevel.INFO,
      tags: [LogTags.APP],
    });

    playlistsManager
      .getQueues()
      .then((playlists) => {
        return (async () => {
          for (const pl of playlists.filter((_) => _.type === 'fs')) {
            const instance = await playlistsManager.getQueueInstance(pl.id);
            await instance.invalidateCache();
            await instance.getContent();
          }
        })();
      })
      .catch(Sentry.captureException);
  }

  // TODO: в аргументы запуска
  // scanner.syncStorage(CONFIG.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))

  return {
    logger,
    classificator,
    scanner,
    playlistsManager,
    streamer,
    publisher,
    player,
    queue,
    scheduler,
    playHelper,
    api,
    init,
  };
};