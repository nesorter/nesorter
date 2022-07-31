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

  FIFO_PATH: process.env.FIFO_PATH || '/tmp/stream.mp3',

  MPV_PATH: process.env.MPV_PATH || '/opt/homebrew/bin/mpv',
  MPV_FADE_TIME: Number(process.env.MPV_FADE_TIME) || 1,

  FFMPEG_BITRATE: Number(process.env.FFMPEG_BITRATE) || 196,
  FFMPEG_CODEC: process.env.FFMPEG_FORMAT === 'ogg' ? 'libvorbis' : 'libmp3lame',
  FFMPEG_OUTPUT_FORMAT: process.env.FFMPEG_FORMAT === 'ogg' ? 'ogg' : 'mp3',
  FFMPEG_CONTENT_TYPE: process.env.FFMPEG_FORMAT === 'ogg' ? 'audio/ogg' : 'audio/mpeg',
}
