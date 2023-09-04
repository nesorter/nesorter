import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { Streamer } from './Streamer';

export class Queue {
  files: string[] = [];
  currentFile = 0;

  constructor(private streamer: Streamer) { }

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
      this.streamer.attachReadStream(readStream, Number(parsedData.format.bitrate) / 8);
      process.env.LOG_INFO === "true" && console.log(`Play [${this.currentFile}/${this.files.length}] ${currentPath}`);

      setTimeout(() => {
        this.currentFile += 1;
        this.startQueue();
      }, (Number(parsedData.format.duration) || 10) * 1000);
    } catch {
      setTimeout(() => {
        this.currentFile += 1;
        this.startQueue();
      }, 10);
    }
  }

  add(filePath: string) {
    this.files.push(filePath);
  }
}
