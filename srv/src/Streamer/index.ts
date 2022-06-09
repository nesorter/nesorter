import Config from '../config';
import ffmpeg, {FfmpegCommand} from 'fluent-ffmpeg';
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger/types';
import { spawn } from 'child_process';
import { makeSafePath } from '../utils';
import config from '../config';
import musicDuration from 'music-duration';

export class Streamer {
  ffmpeg?: FfmpegCommand;
  constructor(private logger: Logger) {}

  get streaming(): boolean {
    return this.ffmpeg !== undefined;
  }

  playFile(filePath: string, startPosition = 5, endPosition = 25, fadeDuration = 5): Promise<void> {
    const childProc = spawn(
      config.MPV_PATH,
      [
        `--no-video --start=${startPosition} --end=${endPosition}`,
        `--af=afade=type=0:duration=${fadeDuration}:start_time=${startPosition},afade=type=1:duration=${fadeDuration}:start_time=${endPosition - fadeDuration}`,
        makeSafePath(filePath)
      ],
      {
        shell: true,
      }
    );

    childProc.addListener('spawn', () => this.logger.log({
      message: `Spawned with command: ${childProc.spawnargs.join(' ')}`,
      level: LogLevel.DEBUG,
      tags: [LogTags.STREAMER, LogTags.MPV],
    }));

    childProc.addListener('message', (data) => this.logger.log({
      message: `process ${childProc.pid}: ${data.toString()}`,
      level: LogLevel.DEBUG,
      tags: [LogTags.STREAMER, LogTags.MPV],
    }));

    return new Promise((res, rej) => {
      // делаем резолв раньше времени, чтобы можно было организовать миксинг треков без лишних костыликов
      setTimeout(() => res(), (endPosition - fadeDuration) * 1000);

      childProc.addListener('exit', () => {
        this.logger.log({
          message: `Playing file ended: ${filePath}`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });
      });

      childProc.addListener('error', (e) => {
        this.logger.log({
          message: `While playng file: ${filePath} ${e}`,
          level: LogLevel.ERROR,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });

        rej(e);
      });
    });
  }

  stopStream() {
    if (!this.streaming) {
      return;
    }

    this.ffmpeg?.kill('SIGKILL');
    this.ffmpeg = undefined;
  }

  startStream() {
    // TODO: config
    const bitrate = 196;
    const codec = 'libmp3lame';
    const outputFormat = 'mp3';
    const contentType = 'audio/mpeg';
    const device = 'hw:0';
    const driver = 'alsa';

    if (this.streaming) {
      throw new Error('Stream already in progress!');
    }

    const instance = ffmpeg()
      .input(device)
      .inputFormat(driver)
      .addInputOption(['-re', '-stream_loop -1'])
      .audioCodec(codec)
      .audioBitrate(bitrate)
      .addOutputOption([`-content_type ${contentType}`, '-map 0', '-map_metadata 0:s:0'])
      .outputFormat(outputFormat)
      .output(`icecast://${Config.SHOUT_USER}:${Config.SHOUT_PASSWORD}@${Config.SHOUT_HOST}:${Config.SHOUT_PORT}/${Config.SHOUT_MOUNT}`);

    instance.on('error', (err) => {
      this.logger.log({ message: `Stream errored: ${err.message}`, level: LogLevel.ERROR, tags: [LogTags.STREAMER, LogTags.FFMPEG] });
      this.stopStream();
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

  async runPlaylist(paths: string[]) {
    for (let filePath of paths) {
      try {
        const duration = await musicDuration(filePath);
        await this.playFile(filePath, 0, duration, 5);
      } catch {}
    }
  }
}
