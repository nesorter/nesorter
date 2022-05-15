import CONFIG from './src/config';
import Scanner from './src/scanner';
import CreateApi from './src/api';
import Classificator from './src/classificator';
import DBStorage from './src/storage';

const storage = new DBStorage(() => {
  const scanner = new Scanner(storage);
  const classificator = new Classificator(storage);
  const api = CreateApi(scanner, classificator, storage);

  scanner
    .scan({ path: CONFIG.CONTENT_ROOT_DIR_PATH, filterRegExp: /.*\.mp3/ })
    .then(() => console.log('INFO: FS scaned'));

  api.listen(CONFIG.API_LISTEN_PORT, () => {
    console.log('INFO: API server started');
  });
});

export default storage;
