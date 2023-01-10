import { API } from 'lib/API';
import { Classificator } from 'lib/Classificator';
import { Logger } from 'lib/Logger';
import { LogLevel, LogTags } from 'lib/Logger.types';
import { Player } from 'lib/Player';
import { PlaylistsManager } from 'lib/PlaylistsManager';
import { PlaylistsPlayHelper } from 'lib/PlaylistsPlayHelper';
import { Publisher } from 'lib/Publisher';
import { Queue } from 'lib/Queue';
import { Scanner } from 'lib/Scanner';
import { Scheduler } from 'lib/Scheduler';
import { Storage } from 'lib/Storage';
import { Streamer } from 'lib/Streamer';

const logger = new Logger();
const classificator = new Classificator(Storage, logger);
const scanner = new Scanner(Storage, logger, classificator);
const playlistsManager = new PlaylistsManager(Storage, logger);
const streamer = new Streamer(logger, scanner);
const publisher = new Publisher(logger);
const player = new Player(logger, publisher);
const queue = new Queue(Storage, player);
const scheduler = new Scheduler(Storage, logger, queue);
const playHelper = new PlaylistsPlayHelper(Storage, queue);

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

// TODO: в аргументы запуска
// scanner.syncStorage(CONFIG.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))

process.on('uncaughtException', (error) => {
  logger.log({
    message: `UNHANDLED ERROR: ${error.message}`,
    level: LogLevel.ERROR,
    tags: [LogTags.APP],
  });
});

process.on('unhandledRejection', (error) => {
  logger.log({
    message: `UNHANDLED REJECTION: ${error}`,
    level: LogLevel.ERROR,
    tags: [LogTags.APP],
  });
});

export default { api };
