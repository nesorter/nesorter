import stream from 'stream';
import { readFile } from 'fs/promises';
import { InFilePosition } from './utils.js';

const LAST_CHUNK_TIME_OFFSET = 1500;
const LAST_CHUNK_SPLIT_PIECES = 8;
const LAST_CHUNK_MINIMUM_ORDER = 10;

export class BroadcastStream {
  scheduledChunks: { chunk: Buffer, duration: number }[] = [];
  chunkRunning: boolean = false;
  readable?: stream.PassThrough | stream.Readable;
  sinksTotal = 0;
  sinks: { id: number, plug: stream.PassThrough, shouldLog: boolean }[] = [];
  timeouts: Record<string, NodeJS.Timeout> = {};

  constructor() {
    setInterval(() => {
      if (this.chunkRunning) {
        return;
      }

      if (!this.scheduledChunks.length) {
        return;
      }

      this.chunkRunning = true;
      const chunk = this.scheduledChunks.shift();

      for (let sink of this.sinks) {
        sink.plug.write(chunk?.chunk);
      }

      setTimeout(() => {
        this.chunkRunning = false;
      }, (Number(chunk?.duration) * 1000) - 10);
    }, 100);
  }

  subscribe(bitrate: number, shouldLog = true) {
    const id = Date.now();
    const plug = new stream.PassThrough({
      readableHighWaterMark: bitrate,
      writableHighWaterMark: bitrate,
    });
    this.sinksTotal += 1;

    this.sinks.push({ id, plug, shouldLog });
    plug.on('unpipe', () => {
      this.sinks = this.sinks.filter(_ => _.id !== id);
    });

    return { id, plug };
  }

  async scheduleChunks(path: string, positions: InFilePosition[], duration: number) {
    const buffer = await readFile(path);
    positions.forEach((value) => {
      const chunk = buffer.subarray(value.startByte, value.endByte);
      this.scheduledChunks.push({ chunk, duration });
    });
  }

  attachReadable(readable: stream.PassThrough | stream.Readable) {
    this.readable = readable;
    let count = 0;
    const getCurrentCount = () => count;

    this.readable.on('data', (chunk) => {
      count += 1;
      const chunkId = count;

      this.timeouts[chunkId] = setTimeout(() => {
        for (let sink of this.sinks) {
          process.env.LOG_DEBUG === "true" && sink.shouldLog && console.log(`Send chunk #${chunkId} to sink #${sink.id}`);

          // if chunk is last, so, split up him and send this with small offset
          if (chunkId === getCurrentCount() && chunkId > LAST_CHUNK_MINIMUM_ORDER) {
            console.log(`Slicing last chunk: ${LAST_CHUNK_SPLIT_PIECES} parts in ${LAST_CHUNK_TIME_OFFSET}ms`);
            const chunkTime = LAST_CHUNK_TIME_OFFSET / LAST_CHUNK_SPLIT_PIECES;
            const slicedSize = Math.round(chunk.length / LAST_CHUNK_SPLIT_PIECES);

            for (let i = 0; i < LAST_CHUNK_SPLIT_PIECES; i++) {
              setTimeout(() => {
                sink.plug.write(chunk.slice(slicedSize * i, slicedSize * (i + 1)));
              }, chunkTime * i);
            }
          } else {
            sink.plug.write(chunk);
          }
        }

        delete this.timeouts[chunkId];
      }, chunkId * 1000);
    });
  }
}
