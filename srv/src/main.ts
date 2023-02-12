import Sentry from '@sentry/node';

import { API } from './lib/API';
import { Classificator } from './lib/Classificator';
import config from './lib/config';
import { Logger } from './lib/Logger';
import { LogLevel, LogTags } from './lib/Logger.types';
import { Player } from './lib/Player';
import { PlaylistsManager } from './lib/PlaylistsManager';
import { FSPlaylist } from './lib/PlaylistsManager.FSPlaylist';
import { PlaylistsPlayHelper } from './lib/PlaylistsPlayHelper';
import { Publisher } from './lib/Publisher';
import { Queue } from './lib/Queue';
import { Scanner } from './lib/Scanner';
import { Scheduler } from './lib/Scheduler';
import { Storage } from './lib/Storage';
import { Streamer } from './lib/Streamer';

if (config.SENTRY_DSN) {
  Sentry.init({ dsn: config.SENTRY_DSN });
  Sentry.captureMessage('App started');
}

const logger = new Logger();
const classificator = new Classificator(Storage, logger);
const scanner = new Scanner(Storage, logger, classificator, onScanned);
const playlistsManager = new PlaylistsManager(Storage, logger, scanner);
const streamer = new Streamer(logger, scanner);
const publisher = new Publisher(logger);
const player = new Player(logger);
const queue = new Queue(Storage, player, publisher);
const scheduler = new Scheduler(Storage, logger, queue, scanner);
const playHelper = new PlaylistsPlayHelper(Storage, queue);

function onScanned() {
  logger.log({
    message: `Start cache warming`,
    level: LogLevel.INFO,
    tags: [LogTags.APP],
  });

  playlistsManager.getQueues().then((playlists) => {
    return (async () => {
      for (const pl of playlists.filter((_) => _.type === 'fs')) {
        const plInst = new FSPlaylist(Storage, pl.id, scanner);
        await plInst.initCache();
      }
    })();
  });

  const api = new API(
    Storage,
    logger,
    scanner,
    classificator,
    playlistsManager,
    streamer,
    scheduler,
    queue,
    playHelper,
  );

  api.bindRoutes().start();
}

// TODO: в аргументы запуска
// scanner.syncStorage(CONFIG.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))
