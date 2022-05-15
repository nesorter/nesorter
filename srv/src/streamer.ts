import Config from './config';
import ffmpeg from 'fluent-ffmpeg';
import {writeFile} from "fs/promises";


export class Streamer {
  stream(playlistPath = 'list.txt', bitrate = 320) {
    const instance = ffmpeg()
      .input(playlistPath)
      .inputFormat('concat')
      .addInputOption(['-safe 0', '-re', '-ss 19'])
      .audioCodec('libmp3lame')
      .audioBitrate(bitrate)
      .addOutputOption(['-content_type audio/mpeg', '-map 0', '-map_metadata 0:s:0'])
      .outputFormat('mp3')
      .output(`icecast://${Config.SHOUT_USER}:${Config.SHOUT_PASSWORD}@${Config.SHOUT_HOST}:${Config.SHOUT_PORT}/${Config.SHOUT_MOUNT}`);

    instance.on('progress', (prog) => console.log(`INFO: ffmpeg: processed ${prog.timemark} - ${prog.targetSize}kb`));
    instance.on('error', err => console.error(`ERR: ffmpeg: ${err.message}`));
    instance.once('end', () => console.log('INFO: ffmpeg: Stream ended'));
    instance.once('start', (commandLine) => {
      console.log(`INFO: ffmpeg: spawned with command: "${commandLine}"`);
    });

    instance.run();

    // закомментил основную команду
    // return [
    //   binPath,
    //
    //   '-re -ss 19', // это форсирует ffmpeg отсылать данные секунда-в-секунду
    //                 // иначе мы получаем эффект стриминга 5 минут трека за 2 секунды :^)
    //
    //   `-f concat -i ${playlistPath}`, // включаем режим конкатенации и скармливаем список файлов
    //
    //   `-acodec libmp3lame -ab ${bitrate}k`, // настройки кодека
    //   `-map 0 -map_metadata 0:s:0`, // маппинг стримов
    //
    //   `-content_type audio/mpeg`,
    //   `-metadata title="${Config.SHOUT_DESCRIPTION}"`,
    //   `-f mp3 icecast://${Config.SHOUT_USER}:${Config.SHOUT_PASSWORD}@${Config.SHOUT_HOST}:${Config.SHOUT_PORT}/${Config.SHOUT_MOUNT}`,
    // ].join(' ');
  }

  async testRun(path: string) {
    const listPath = 'list.txt';
    await writeFile(listPath, `file '${this.convertToSafe(path)}'\n`);
    this.stream(listPath);
  }

  convertToSafe(str: string): string {
    return str.replaceAll(`'`,`\\'`);
  }
}
