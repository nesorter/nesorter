import * as dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  API_LISTEN_PORT: Number(process.env.API_LISTEN_PORT) || 3001,

  CONTENT_ROOT_DIR_PATH: process.env.CONTENT_ROOT_DIR_PATH || '/app/lib',
  LOG_PATH: process.env.LOG_PATH || '/tmp/nesorter.log',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'secret',

  SHOUT_ADMIN_USER: process.env.SHOUT_ADMIN_USER || '',
  SHOUT_ADMIN_PASSWORD: process.env.SHOUT_ADMIN_PASSWORD || '',

  SHOUT_HOST: process.env.SHOUT_HOST || '',
  SHOUT_PORT: Number(process.env.SHOUT_PORT) || 8000,
  SHOUT_PASSWORD: process.env.SHOUT_PASSWORD || '',
  SHOUT_URL: process.env.SHOUT_URL || '',
  SHOUT_MOUNT: process.env.SHOUT_MOUNT || '',
  SHOUT_DESCRIPTION: process.env.SHOUT_DESCRIPTION || '',
  SHOUT_USER: process.env.SHOUT_USER || '',

  PLAYING_MODE: process.env.PLAYING_MODE || 'socket',
  HARDWARE_PLAYER_FFMPEG_DRIVER: process.env.HARDWARE_PLAYER_FFMPEG_DRIVER || '',
  HARDWARE_PLAYER_FFMPEG_DEVICE: process.env.HARDWARE_PLAYER_FFMPEG_DEVICE || '',

  MPV_PATH: process.env.MPV_PATH || '/usr/bin/mpv',
  MPV_FADE_TIME: Number(process.env.MPV_FADE_TIME) || 0,

  TZ_HOURS_SHIFT: Number(process.env.TZ_HOURS_SHIFT) || 0,

  FFMPEG_BITRATE: Number(process.env.FFMPEG_BITRATE) || 256,
  FFMPEG_CODEC: process.env.FFMPEG_FORMAT === 'ogg' ? 'libvorbis' : 'libmp3lame',
  FFMPEG_OUTPUT_FORMAT: process.env.FFMPEG_FORMAT === 'ogg' ? 'ogg' : 'mp3',
  FFMPEG_CONTENT_TYPE: process.env.FFMPEG_FORMAT === 'ogg' ? 'audio/ogg' : 'audio/mpeg',

  LOKI_HOST: process.env.LOKI_HOST,
  SENTRY_DSN: process.env.SENTRY_DSN,
};
