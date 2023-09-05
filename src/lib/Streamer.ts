import { BroadcastStream } from './BroadcastStream.js';
import { Express } from 'express';
import { ReadStream } from 'fs';

export class Streamer {
  app: Express;
  broadcast: BroadcastStream;
  bitrate = 0;
  sended = 0;

  constructor(app: Express, port: number) {
    this.broadcast = new BroadcastStream();
    this.app = app;
    this.app.listen(port);
    this.app.disable('x-powered-by');
    this.setupRouting();

    const { plug } = this.broadcast.subscribe(128000);
    plug.on('data', (chunk) => {
      this.sended += chunk.length;
    });

    setInterval(() => {
      process.env.LOG_DEBUG === "true" && console.log(`Kbytes sended: ${this.sended / 1000}`)
    }, 10000);
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

  setupRouting() {
    this.app.get('/listen', (req, res) => {
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
