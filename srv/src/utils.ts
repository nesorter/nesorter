import { readFile } from 'fs/promises';

const wavesCount = 1024 * 2;
const decode = require('audio-decode');

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// export async function getQueue(id: string, storage: DBStorage, name?: string) {
//   const queue = new Queue(id, storage);
//   await queue.init(name);
//   return queue;
// }

type BufferWF = { 
  length: number;
  sampleRate: number;
  duration: number;
  _channelData: number[][];
};

export async function getWaveformInfo (filepath: string) {
  const fileBuffer = await readFile(filepath);

  try {
    const buffer: BufferWF = await decode(fileBuffer);

    const results: number[] = [];
    const step = Math.floor(buffer.length / wavesCount);

    for (let i = 0; i < wavesCount; i++) {
      const value = Math.abs(buffer._channelData[0][i * step]);
      results.push(Math.floor(value * 100000) / 100000);
    }

    return results;
  } catch (e) {
    console.log('ERROR: unable to get waveform: ', e);
    return [];
  }
}
