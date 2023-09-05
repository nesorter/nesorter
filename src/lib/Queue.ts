import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { Streamer } from './Streamer.js';

export class Queue {
  files: string[] = [];
  currentFile = 0;
  timeout?: NodeJS.Timeout;
  readStreamDetacher?: () => void;

  constructor(private streamer: Streamer) { }

  stopQueue() {
    process.env.LOG_INFO === "true" && console.log('Called stop queue');

    if (this.readStreamDetacher) {
      this.readStreamDetacher();
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.currentFile = 0;
  }

  async startQueue() {
    if (this.currentFile === this.files.length) {
      this.currentFile = 0;
    }

    const { parseBuffer } = await import('music-metadata');
    const currentPath = this.files[this.currentFile];

    try {
      const buffer = await readFile(currentPath);
      const parsedData = await parseBuffer(buffer, undefined, {
        duration: true,
        includeChapters: true,
        skipCovers: true,
      });

      const readStream = createReadStream(currentPath, { highWaterMark: Number(parsedData.format.bitrate) / 8 });
      this.readStreamDetacher = this.streamer.attachReadStream(readStream, Number(parsedData.format.bitrate) / 8);
      process.env.LOG_INFO === "true" && console.log(`Play [${this.currentFile}/${this.files.length}] ${currentPath}`);

      this.timeout = setTimeout(() => {
        this.currentFile += 1;
        this.startQueue();
      }, (Number(parsedData.format.duration) || 10) * 1000);
    } catch {
      this.timeout = setTimeout(() => {
        this.currentFile += 1;
        this.startQueue();
      }, 10);
    }
  }

  add(filePath: string) {
    this.files.push(filePath);
  }
}
