import CONFIG from "./config";
import { Storage } from './Storage';
import { Logger } from './Logger';
import { Scanner } from './Scanner';
import { Classificator } from './Classificator';
import { PlaylistsManager } from './PlaylistsManager';
import { Streamer } from './Streamer';
import { API } from './API';
import { Scheduler } from './Scheduler';
import { LogLevel, LogTags } from "./Logger/types";

const logger = new Logger(Storage);
const classificator = new Classificator(Storage, logger);
const scanner = new Scanner(Storage, logger, classificator);
const playlistsManager = new PlaylistsManager(Storage, logger);
const streamer = new Streamer(logger, scanner);
const scheduler = new Scheduler(Storage, logger, streamer);

const api = new API(Storage, logger, scanner, classificator, playlistsManager, streamer, scheduler);
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
