export default {
  API_LISTEN_PORT: Number(process.env.API_LISTEN_PORT) || 3001,

  HOST_CONTENT_ROOT_DIR_PATH: process.env.HOST_CONTENT_ROOT_DIR_PATH || '',
  DCKR_CONTENT_ROOT_DIR_PATH: process.env.DCKR_CONTENT_ROOT_DIR_PATH || '',

  SHOUT_HOST: process.env.SHOUT_HOST || '',
  SHOUT_PROTOCOL: Number(process.env.SHOUT_PROTOCOL) || 0,
  SHOUT_PORT: Number(process.env.SHOUT_PORT) || 0,
  SHOUT_PASSWORD: process.env.SHOUT_PASSWORD || '',
  SHOUT_MOUNT: process.env.SHOUT_MOUNT || '',
  SHOUT_USER: process.env.SHOUT_USER || '',
  SHOUT_FORMAT: Number(process.env.SHOUT_FORMAT) || 0,
}
