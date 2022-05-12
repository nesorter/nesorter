require('dotenv').config();
import CONFIG from './config';
import Scanner from './lib/scanner';
import { createApi } from './lib/api';
import Classificator from './lib/classificator';
import DBStorage from './lib/storage';

const storage = new DBStorage(() => {
  const scanner = new Scanner(storage);
  const classificator = new Classificator(storage);
  const api = createApi(scanner, classificator, storage);

  scanner
    .scan({ path: CONFIG.DCKR_CONTENT_ROOT_DIR_PATH, filterRegExp: /.*\.mp3/ })
    .then(() => console.log('INFO: FS scaned'));

  api.listen(CONFIG.API_LISTEN_PORT, () => {
    console.log('INFO: API server started');
  });
});
