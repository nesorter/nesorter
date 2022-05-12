import { Queue } from "./queue";
import {readFile} from 'fs/promises';
import DBStorage from "./storage";

const wavesCount = 1024 * 8;
const decode = require('audio-decode');

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getQueue(id: string, storage: DBStorage, name?: string) {
  const queue = new Queue(id, storage);
  await queue.init(name);
  return queue;
}

type BufferWF = { 
  length: number;
  sampleRate: number;
  duration: number;
  _channelData: number[][];
};

export async function getWaveformInfo (filepath: string) {
  const fileBuffer = await readFile(filepath);

  return new Promise((res, rej) => {
    decode(fileBuffer, (err: any, buffer: BufferWF) => {
      if (err) {
        rej(err);
      }

      const results: number[] = [];
      const step = Math.floor(buffer.length / wavesCount);

      for (let i = 0; i < wavesCount; i++) {
        const value = Math.abs(buffer._channelData[0][i * step]);
        results.push(value);
      }

      res(results);
    });
  });
}