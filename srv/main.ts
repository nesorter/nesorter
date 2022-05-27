import CONFIG from './src/config';
// import CreateApi from './src/api';
// import Classificator from './src/classificator';
import { Storage } from './src/storage';
import { Logger } from './src/Logger';
import { Scanner } from './src/Scanner';

const logger = new Logger(Storage);
const scanner = new Scanner(Storage, logger);
// const classificator = new Classificator(Storage, scanner);
// const api = CreateApi(scanner, classificator);

// scanner
//   .syncStorage(CONFIG.CONTENT_ROOT_DIR_PATH, ({ name }) => /.*\.mp3/.test(name))
//   .then(console.log);

// scanner.getChain().then(console.log)

// api.listen(CONFIG.API_LISTEN_PORT, () => {
//   console.log('INFO: API server started');
// });

// export default { Storage, api, scanner, classificator };
export default { Storage };
