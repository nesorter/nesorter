import { readFileSync } from 'fs';
import { StorageType } from './Storage';
import { AudioAnalyzer } from '@lesjoursfr/audio-waveform';
import { spawn } from 'child_process';

export function asyncSpawn(cmd: string, args: string[]): Promise<void> {
  return new Promise((res, rej) => {
    spawn(cmd, args, { shell: true }).on('exit', res);
  });
}

export function range(num: number): number[] {
  return Array(num).fill(0).map((_, i) => i);
}

const wavesCount = 1024 * 2;

export function makeSafePath(path: string): string {
  return path
    .replaceAll(' ', '\\ ')
    .replaceAll(`'`, `\\'`)
    .replaceAll(`&`, `\\&`)
    .replaceAll(`;`, `\\;`)
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getWaveformInfo (filepath: string) {
  try {
    const audioAnalyzer = new AudioAnalyzer(filepath);
    const data = await audioAnalyzer.waveform();
    const buffer = data.waveform;

    const results: number[] = [];
    const step = Math.floor(buffer.length / wavesCount);

    for (let i = 0; i < wavesCount; i++) {
      const value = Math.abs(buffer[i * step]);
      results.push(Math.floor(value * 100000) / 100000);
    }

    return results;
  } catch (e) {
    console.log('ERROR: unable to get waveform: ', e);
    return [];
  }
}

export async function convertJsonDbToNewDb(jsondbFilepath: string, db: StorageType): Promise<void> {
  const scanned = await db.fSItem.findMany();
  const data = JSON.parse(readFileSync(jsondbFilepath).toString());

  const categories = data.categories as { name: string; values: string[] }[];

  const queuesData = Object
    .entries(data)
    .filter(([key]) => key.includes('queue-'))
    .map(([key, value]) => ({
      name: key,
      items: (value as { order: number, filePath: string }[])
        .map(i => ({ ...i, filePath: i.filePath.replaceAll('/home/kugichka/music/avgustina/', '') }))
    }));

  const trackData = Object
    .entries(data)
    .filter(([key]) => key.includes('classificator_'))
    .map(([key, value]) => ({ filename: key.replaceAll('classificator_', ''), categories: value as { name: string, values: string[] }[] }));

  for (let cat of categories) {
    await db.classification.create({ data: { name: cat.name, values: cat.values.join(',') } });
  }

  for (let queue of queuesData) {
    const name = queue.name;
    const createdPlaylist = await db.playlists.create({ data: { name, type: 'manual' } })
    const playlistId = createdPlaylist.id;

    for (let item of queue.items) {
      const scannedItem = scanned.find(si => si.name === item.filePath);

      if (scannedItem) {
        await db.manualPlaylistItem.create({ data: { order: item.order, playlistId, filehash: scannedItem.filehash } });
      }
    }
  }

  const classifications = await db.classification.findMany();

  for (let item of trackData) {
    const scannedItem = scanned.find(si => si.name === item.filename);

    if (scannedItem) {
      const jsoned = item.categories.map(cat => ({ id: classifications.find(i => i.name === cat.name)?.id || 0, name: cat.name, values: cat.values }));
      await db.classificatedItem.create({ data: { filehash: scannedItem.filehash, json: JSON.stringify(jsoned) } });
    }
  }
}
