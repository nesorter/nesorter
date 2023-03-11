import { spawn } from 'child_process';
import { differenceInSeconds, endOfDay, secondsInDay } from 'date-fns';
import { RequestHandler } from 'express';

import config from './config';
import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';

export function withLogger(logger: Logger, rq: RequestHandler): RequestHandler {
  return (req, res, next) => {
    logger.log({
      message: `${req.method} ${req.path}`,
      level: LogLevel.DEBUG,
      tags: [LogTags.API],
    });
    rq(req, res, next);
  };
}

export function withAdminToken(rq: RequestHandler): RequestHandler {
  return (req, res, next) => {
    if (req.header('token') === config.ADMIN_TOKEN) {
      rq(req, res, next);
    } else {
      // eslint-disable-next-line no-cyrillic-string/no-cyrillic-string
      res.status(403).json({ error: 'Ты куда лезешь?' });
    }
  };
}

export function asyncSpawn(cmd: string, args: string[]): Promise<void> {
  return new Promise((res) => {
    spawn(cmd, args, { shell: true }).on('exit', res);
  });
}

export function range(num: number): number[] {
  return Array(num)
    .fill(0)
    .map((_, i) => i);
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
    .replaceAll('/', '\\/')
    .replaceAll('$', '\\$')
    .replaceAll(',', '\\,');
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getWaveformInfo(logger: Logger, filepath: string) {
  logger.log({
    message: 'ERROR: unable to get waveform: ',
    extraData: { err: JSON.stringify({}, null, 2) },
  });

  return [];
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

export function shuffle<T>(array: Array<T>) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

export const getSamaraDate = () =>
  new Date(new Date().setHours(new Date().getHours() + config.TZ_HOURS_SHIFT));

export function currentSecondsFromDayStart() {
  return secondsInDay - differenceInSeconds(endOfDay(getSamaraDate()), getSamaraDate());
}
