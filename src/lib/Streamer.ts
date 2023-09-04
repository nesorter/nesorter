import { BroadcastStream } from './BroadcastStream';
import { Express } from 'express';
import { ReadStream, createWriteStream } from 'fs';
import { PassThrough } from 'stream'

export class Streamer {
  app: Express;
  broadcast: BroadcastStream;
  metaint = 8192;
  metadata = "StreamTitle='A nice song';";
  bitrate = 0;

  constructor(app: Express) {
    this.broadcast = new BroadcastStream();
    this.app = app;
    this.app.disable('x-powered-by');
    this.setupRouting();

    const file = createWriteStream(`test-${Date.now()}.ogg`);
    let sended = 0;
    const { plug } = this.broadcast.subscribe(128000);
    plug.on('data', (chunk) => {
      sended += chunk.length;
      file.write(chunk);
    });
    setInterval(() => {
      console.log(`Kbytes sended: ${sended / 1000}`)
    }, 1000);
  }

  attachReadStream(sink: ReadStream, bitrate: number) {
    this.bitrate = bitrate;
    this.broadcast.attachReadable(sink);
  }

  setupRouting() {
    this.app.get('/listen', (req, res) => {
      const headers = {
        "Content-Type": "audio/ogg",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache, no-store",
        "Pragma": "no-cache",
      };
      res.writeHead(200, headers);

      const { id, plug } = this.broadcast.subscribe(this.bitrate);
      plug.on('data', (chunk) => res.write(chunk));

      console.log(`Client #${id} connected`);
      req.socket.on('close', () => {
        console.log(`Client #${id} disconnects`);
        plug.emit('unpipe');
      });
    });
  }
}
