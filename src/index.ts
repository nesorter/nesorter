import express from 'express';
import fs from 'fs';
import { readFile } from 'fs/promises'
import { Streamer } from './lib/Streamer';
import { FileSystemScanner } from './lib/FileSystemScanner';
const prism = require('prism-media');

const main = async () => {
  const { parseBuffer } = await import('music-metadata');
  const app = express();
  app.listen(3000);

  const streamer = new Streamer(app);
  const scanner = new FileSystemScanner('/Users/kugichka/Music/NeFormat');

  const shuffle = <T>(array: T[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  scanner.scan().then(_ => shuffle(_).slice(0, 5).reverse()).then(async (items) => {
    let startNextOffset = 0;

    for (let item of items) {
      const buffer = await readFile(item.fullPath);
      const parsedData = await parseBuffer(buffer, undefined, {
        duration: true,
        includeChapters: true,
        skipCovers: true,
      });

      setTimeout(() => {
        console.log(`Play ${item.fullPath}`);
        const readStream = fs.createReadStream(item.fullPath, { highWaterMark: Number(parsedData.format.bitrate) / 8 });
        const transcoder = new prism.FFmpeg({
          args: [
            '-analyzeduration', `0`,
            '-loglevel', '3',
            '-f', 's16le',
            '-ar', '44100',
            '-ac', '2',
          ],
        });
        const opus = new prism.opus.Encoder({
          rate: 48000,
          channels: 2,
          frameSize: 960,
        });
        readStream.pipe(transcoder).pipe(opus);

        streamer.attachReadStream(opus, Number(parsedData.format.bitrate) / 8);
      }, (startNextOffset * 1000));

      startNextOffset += Number(parsedData.format.duration);
    }
  });
}

main();
