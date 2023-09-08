import { BroadcastStream } from './BroadcastStream.js';
import express, { Express } from 'express';
import { ReadStream } from 'fs';
import { getFramesPositions, sanitizeFsPath, splitMp3File } from './utils.js';

const CHUNK_DURATION = 1;

export class Streamer {
  app: Express;
  broadcast: BroadcastStream;
  bitrate = 0;
  sended = 0;

  constructor(port: number, mountpoint: string) {
    this.broadcast = new BroadcastStream();
    this.app = express();
    this.app.listen(port);
    this.app.disable('x-powered-by');
    this.setupRouting(mountpoint);

    const { plug } = this.broadcast.subscribe(128000, false);
    plug.on('data', (chunk) => {
      this.sended += chunk.length;
    });
  }

  attachReadStream(sink: ReadStream, bitrate: number) {
    this.bitrate = bitrate;
    this.broadcast.attachReadable(sink);

    return () => {
      if (this.broadcast.readable) {
        this.broadcast.readable.emit('close');
        delete this.broadcast.readable;
      }

      for (let key of Object.keys(this.broadcast.timeouts)) {
        clearTimeout(this.broadcast.timeouts[key]);
        delete this.broadcast.timeouts[key];
      }
    }
  }

  pushFile(path: string) {
    getFramesPositions(path).then((positions) => this.broadcast.scheduleChunks(path, positions, CHUNK_DURATION));

    // splitMp3File(sanitizeFsPath(path), CHUNK_DURATION).then((chunks) => {
    //   this.broadcast.scheduleChunks(chunks, CHUNK_DURATION);
    // });
  }

  setupRouting(mountpoint: string) {
    this.app.get(mountpoint, (req, res) => {
      const headers = {
        "Content-Type": "audio/mp3",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache, no-store",
        "Pragma": "no-cache",
      };
      res.writeHead(200, headers);

      const { id, plug } = this.broadcast.subscribe(this.bitrate);
      plug.on('data', (chunk) => res.write(chunk));

      process.env.LOG_INFO === "true" && console.log(`Client #${id} connected`);
      req.socket.on('close', () => {
        process.env.LOG_INFO === "true" && console.log(`Client #${id} disconnects`);
        plug.emit('unpipe');
      });
    });
  }
}
