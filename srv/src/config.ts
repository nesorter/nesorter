require('dotenv').config();

export default {
  API_LISTEN_PORT: Number(process.env.API_LISTEN_PORT) || 3001,

  CONTENT_ROOT_DIR_PATH: process.env.CONTENT_ROOT_DIR_PATH || '',
  LOG_PATH: process.env.LOG_PATH || 'logs.log',

  SHOUT_HOST: process.env.SHOUT_HOST || '',
  SHOUT_PORT: Number(process.env.SHOUT_PORT) || 0,
  SHOUT_PASSWORD: process.env.SHOUT_PASSWORD || '',
  SHOUT_URL: process.env.SHOUT_URL || '',
  SHOUT_MOUNT: process.env.SHOUT_MOUNT || '',
  SHOUT_DESCRIPTION: process.env.SHOUT_DESCRIPTION || '',
  SHOUT_USER: process.env.SHOUT_USER || '',
}
