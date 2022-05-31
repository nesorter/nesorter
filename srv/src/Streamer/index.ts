import Config from '../config';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile } from "fs/promises";
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger/types';

export class Streamer {
  streaming: boolean = false;

  constructor(private logger: Logger) {}

  stream(playlistPath = 'list.txt', bitrate = 320) {
    if (this.streaming) {
      throw new Error('Stream already in progress!');
    }

    let counter = 0;
    const instance = ffmpeg()
      .input(`${playlistPath}`)
      .inputFormat('concat')
      .addInputOption(['-safe 0', '-re', '-stream_loop -1'])
      .audioCodec('libmp3lame')
      .audioBitrate(bitrate)
      .addOutputOption(['-content_type audio/mpeg', '-map 0', '-map_metadata 0:s:0'])
      .outputFormat('mp3')
      .output(`icecast://${Config.SHOUT_USER}:${Config.SHOUT_PASSWORD}@${Config.SHOUT_HOST}:${Config.SHOUT_PORT}/${Config.SHOUT_MOUNT}`);

    instance.on('progress', (status) => {
      counter += 1;

      if (counter > 5) {
        this.logger.log({ message: `Stream process: ${status.timemark} - ${status.targetSize}kb`, level: LogLevel.ERROR, tags: [LogTags.STREAMER] });
        counter = 0;
      }
    });

    instance.on('error', (err) => {
      this.logger.log({ message: `Stream errored: ${err.message}`, level: LogLevel.ERROR, tags: [LogTags.STREAMER] });
      this.streaming = false;
    });

    instance.once('end', () => {
      this.logger.log({ message: `Stream ended`, level: LogLevel.INFO, tags: [LogTags.STREAMER] });
      this.streaming = false;
    });

    instance.once('start', (commandLine) => {
      this.logger.log({ message: `Spawned with command: "${commandLine}"`, level: LogLevel.DEBUG, tags: [LogTags.STREAMER] });
    });

    this.streaming = true;
    instance.run();
  }

  async runPlaylist(paths: string[], listPath = 'list.txt') {
    if (this.streaming) {
      throw new Error('Streaming already in progress!');
    }

    // костыль, потому что кажется concat ффмпега не умеет в (за)лупинг
    let copied: string[] = paths.map((p) => `file '${this.convertToSafe(p)}'`);
    let arrayed = copied;
    for (let i = 1; i <= 100; i++) {
      arrayed = [...arrayed, ...copied];
    }

    await writeFile(listPath, arrayed.join('\n'));
    this.stream(listPath);
  }

  convertToSafe(str: string): string {
    return str.replaceAll(`'`,`'\\''`);
  }
}
