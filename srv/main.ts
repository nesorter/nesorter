import { Storage } from './src/Storage';
import { Logger } from './src/Logger';
import { Scanner } from './src/Scanner';
import { Classificator } from './src/Classificator';
import { PlaylistsManager } from './src/PlaylistsManager';
import { Streamer } from './src/Streamer';
import { API } from './src/API';
import CONFIG from "./src/config";
import { Scheduler } from './src/Scheduler';

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

export default { api };
