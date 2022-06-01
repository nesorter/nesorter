import { Storage } from './src/Storage';
import { Logger } from './src/Logger';
import { Scanner } from './src/Scanner';
import { convertJsonDbToNewDb } from './src/utils';
import config from './src/config';

const logger = new Logger(Storage);
const scanner = new Scanner(Storage, logger);

scanner.syncStorage(config.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))
  .then(() => {
    convertJsonDbToNewDb('db.json', Storage);
  })
  .catch(console.error);

export default { scanner };
