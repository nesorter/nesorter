import stream from 'stream';

export class BroadcastStream {
  readable?: stream.PassThrough | stream.Readable;
  sinks: { id: number, plug: stream.PassThrough }[] = [];

  subscribe(bitrate: number) {
    const id = Date.now();
    const plug = new stream.PassThrough({
      readableHighWaterMark: bitrate,
      writableHighWaterMark: bitrate,
    });

    this.sinks.push({ id, plug });
    plug.on('unpipe', () => {
      this.sinks = this.sinks.filter(_ => _.id !== id);
    });

    return { id, plug };
  }

  attachReadable(readable: stream.PassThrough | stream.Readable) {
    this.readable = readable;
    let count = 0;

    this.readable.on('data', (chunk) => {
      count += 1;
      const chunkId = count;

      setTimeout(() => {
        for (let sink of this.sinks) {
          process.env.LOG_DEBUG === "true" && console.log(`Send chunk #${chunkId} to sink #${sink.id}`);
          sink.plug.write(chunk);
        }
      }, chunkId * 1000);
    });
  }
}
