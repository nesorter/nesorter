import { Player } from 'lib/Player';
import { Queue } from 'lib/Queue';
import { Storage } from 'lib/Storage';
import { Logger } from 'lib/Logger';
import { Scanner } from 'lib/Scanner';
import { Classificator } from 'lib/Classificator';
import { PlaylistsManager } from 'lib/PlaylistsManager';
import { Streamer } from 'lib/Streamer';
import { API } from 'lib/API';
import { Scheduler } from 'lib/Scheduler';
import { LogLevel, LogTags } from "lib/Logger.types";
import { Publisher } from 'lib/Publisher';
import { PlaylistsPlayHelper } from 'lib/PlaylistsPlayHelper';

const logger = new Logger(Storage);
const classificator = new Classificator(Storage, logger);
const scanner = new Scanner(Storage, logger, classificator);
const playlistsManager = new PlaylistsManager(Storage, logger);
const streamer = new Streamer(logger, scanner);
const publisher = new Publisher(logger);
const player = new Player(logger, publisher);
const queue = new Queue(Storage, player);
const scheduler = new Scheduler(Storage, logger, queue);
const playHelper = new PlaylistsPlayHelper(Storage, queue);

const api = new API(Storage, logger, scanner, classificator, playlistsManager, streamer, scheduler, queue, playHelper);
api.bindRoutes().start();

// TODO: в аргументы запуска
// scanner.syncStorage(CONFIG.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))

process.on('uncaughtException', (error) => {
  logger.log({ message: `UNHANDLED ERROR: ${error.message}`, level: LogLevel.ERROR, tags: [LogTags.APP] });
});

process.on('unhandledRejection', (error) => {
  logger.log({ message: `UNHANDLED REJECTION: ${error}`, level: LogLevel.ERROR, tags: [LogTags.APP] });
});

export default { api };
