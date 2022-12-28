import { readFileSync } from 'fs';
import { StorageType } from './Storage';
import { AudioAnalyzer } from '@lesjoursfr/audio-waveform';
import { spawn } from 'child_process';
import { Logger } from './Logger';
import { RequestHandler } from 'express';
import { LogLevel, LogTags } from './Logger/types';

export function withLogger(logger: Logger, rq: RequestHandler): RequestHandler {
  return (req, res, next) => {
    logger.log({ message: `${req.method} ${req.path}`, level: LogLevel.DEBUG, tags: [LogTags.API] });
    rq(req, res, next);
  }
}

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
    .replaceAll(')', '\\)')
    .replaceAll('>', '\\>')
    .replaceAll('｜', '\\｜')
    .replaceAll('⧸', '\\⧸')
    .replaceAll('|', '\\|')
    .replaceAll('/', '\\/');
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getWaveformInfo (logger: Logger, filepath: string) {
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
    logger.log({ message: 'ERROR: unable to get waveform: ', extraData: { err: JSON.stringify(e, null, 2) } });
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

export function getRandomArbitrary(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

export function shuffle<T>(array: Array<T>) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
