import Config from '../config';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger/types';
import config from '../config';
import { Scanner } from "../Scanner";

export class Streamer {
  currentPlaylistId?: string;
  playing = false;
  ffmpeg?: FfmpegCommand;
  counter = 0;

  constructor(private logger: Logger, private scanner: Scanner) {}

  public get streaming(): boolean {
    return this.ffmpeg !== undefined;
  }

  public stopStream() {
    if (!this.streaming) {
      return;
    }

    this.ffmpeg?.kill('SIGKILL');
    this.ffmpeg = undefined;
  }

  public async startStream() {
    if (this.streaming) {
      throw new Error('Stream already in progress!');
    }

    const input = config.PLAYING_MODE === 'socket'
      ? 'unix:/tmp/output_socket.mp3'
      : config.HARDWARE_PLAYER_FFMPEG_DEVICE;

    const instance = ffmpeg()
      .input(input)
      .addInputOption(['-re', '-stream_loop -1'])
      .audioCodec(config.FFMPEG_CODEC)
      .audioBitrate(config.FFMPEG_BITRATE)
      .addOutputOption([
        `-content_type ${config.FFMPEG_CONTENT_TYPE}`,
        '-map 0',
        '-map_metadata 0:s:0',
      ])
      .outputFormat(config.FFMPEG_OUTPUT_FORMAT)
      .output(`icecast://${Config.SHOUT_USER}:${Config.SHOUT_PASSWORD}@${Config.SHOUT_HOST}:${Config.SHOUT_PORT}/${Config.SHOUT_MOUNT}`);

    if (config.PLAYING_MODE === 'hardware') {
      instance.inputFormat(config.HARDWARE_PLAYER_FFMPEG_DRIVER);
    }

    instance.on('error', (err) => {
      this.logger.log({ message: `Stream errored: ${err.message}`, level: LogLevel.ERROR, tags: [LogTags.STREAMER, LogTags.FFMPEG] });
      this.stopStream();

      if (!err.message.includes('SIGKILL')) {
        this.startStream();
      }
    });

    instance.on('progress', (progressData) => {
      this.counter = this.counter + 1;

      if (this.counter === 25) {
        this.counter = 0;
        this.logger.log({ message: `FFMpeg info`, extraData: progressData, level: LogLevel.INFO, tags: [LogTags.FFMPEG] });
      }
    });

    instance.once('end', () => {
      this.logger.log({ message: `Stream ended`, level: LogLevel.INFO, tags: [LogTags.STREAMER] });
      this.stopStream();
    });

    instance.once('start', (commandLine) => {
      this.logger.log({ message: `Spawned with command: "${commandLine}"`, level: LogLevel.DEBUG, tags: [LogTags.STREAMER, LogTags.FFMPEG] });
    });

    this.ffmpeg = instance;
    instance.run();
  }
}
