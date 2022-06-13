import Config from '../config';
import ffmpeg, {FfmpegCommand} from 'fluent-ffmpeg';
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger/types';
import { spawn } from 'child_process';
import { makeSafePath } from '../utils';
import config from '../config';
import { Scanner } from "../Scanner";

export class Streamer {
  needStop = false;
  ffmpeg?: FfmpegCommand;
  constructor(private logger: Logger, private scanner: Scanner) {}

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
      message: `Spawned with command: "${childProc.spawnargs.join(' ')}"`,
      level: LogLevel.DEBUG,
      tags: [LogTags.STREAMER, LogTags.MPV],
    }));

    childProc.addListener('message', (data) => this.logger.log({
      message: `process ${childProc.pid}: ${data.toString()}`,
      level: LogLevel.DEBUG,
      tags: [LogTags.STREAMER, LogTags.MPV],
    }));

    return new Promise((res, rej) => {
      // делаем поллинг для остановки проиграывания
      const polling = setInterval(() => {
        if (this.needStop) {
          this.logger.log({
            message: `Catch up user stop request. For: ${filePath}`,
            level: LogLevel.DEBUG,
            tags: [LogTags.STREAMER, LogTags.MPV],
          });

          this.needStop = false;
          childProc.kill('SIGINT');
          rej('USER_STOP');
        }
      }, 500);

      // делаем резолв раньше времени, чтобы можно было организовать миксинг треков без лишних костыликов
      // дропаем поллинг, это важно
      setTimeout(() => {
        clearInterval(polling);
        res();
      }, (endPosition - fadeDuration) * 1000);

      childProc.addListener('exit', (e) => {
        this.logger.log({
          message: `Exitcode: ${e} for: ${filePath}`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });

        clearInterval(polling);
      });

      childProc.addListener('error', (e) => {
        this.logger.log({
          message: `While playng file: ${filePath} ${e}`,
          level: LogLevel.ERROR,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });

        clearInterval(polling);
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

  stopPlay() {
    this.needStop = true;
  }

  startStream() {
    if (this.streaming) {
      throw new Error('Stream already in progress!');
    }

    const instance = ffmpeg()
      .input(config.FFMPEG_DEVICE)
      .inputFormat(config.FFMPEG_DRIVER)
      .addInputOption(['-re', '-stream_loop -1'])
      .audioCodec(config.FFMPEG_CODEC)
      .audioBitrate(config.FFMPEG_BITRATE)
      .addOutputOption([`-content_type ${config.FFMPEG_CONTENT_TYPE}`, '-map 0', '-map_metadata 0:s:0'])
      .outputFormat(config.FFMPEG_OUTPUT_FORMAT)
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

  async runPlaylist(hashes: string[]) {
    // Да, вот такой вот infinite loop :^)
    for (let i = 1; i <= Number.MAX_SAFE_INTEGER; i++) {
      for (let fileHash of hashes) {
        try {
          const fileData = await this.scanner.getFsItem(fileHash);

          if (fileData) {
            await this.playFile(
              fileData.path,
              fileData.trimStart,
              fileData.trimEnd,
              config.MPV_FADE_TIME
            );
          }
        } catch (e) {
          if (e === 'USER_STOP') {
            return;
          }
        }
      }
    }
  }
}
