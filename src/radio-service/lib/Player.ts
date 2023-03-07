import * as Sentry from '@sentry/node';
import { spawn } from 'child_process';
import { createServer, Server, Socket } from 'net';
import kill from 'tree-kill';

import { AggregatedFileItem } from '../types/Scanner';
import config from './config';
import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';
import { asyncSpawn, makeSafePath, range } from './utils';

export class Player {
  socket: { id: number; instance: Server; isBind: boolean }[] = [];
  outputSocket?: Socket;
  needStop = false;

  constructor(private logger: Logger) {
    const logMessage = config.PLAYING_MODE === 'socket' ? 'Init sockets' : 'Skip init socket';
    logger.log({ message: `PLAYING_MODE is '${config.PLAYING_MODE}'. ${logMessage}` });

    if (config.PLAYING_MODE === 'socket') {
      this.initSockets().catch(Sentry.captureException);
    }
  }

  private async initSockets() {
    await Promise.all([
      asyncSpawn('rm', [`/tmp/listen_socket_${0}.mp3`]),
      asyncSpawn('rm', [`/tmp/listen_socket_${1}.mp3`]),
      asyncSpawn('rm', [`/tmp/output_socket.mp3`]),
    ]);

    this.logger.log({ message: `Sockets cleaned` });

    createServer((client) => {
      this.outputSocket = client;
    }).listen(`/tmp/output_socket.mp3`, () => {
      this.logger.log({ message: `Socket created at /tmp/output_socket.mp3` });
    });

    this.socket = range(2).map((id) => ({
      id,
      isBind: false,
      instance: (() => {
        const socket = createServer();

        socket.on('connection', (client) => {
          this.logger.log({ message: `Someone connected to socket /tmp/listen_socket_${id}.mp3` });

          client.on('data', (data) => {
            const self = this.socket.find((_) => _.id === id);

            // Не делаем роутинг в случае когда сокет не используется
            if (!self?.isBind) {
              return;
            }

            this.outputSocket?.write(data, () => null);
          });

          client.on('end', () => {
            this.logger.log({
              message: `Someone disconnected from socket /tmp/listen_socket_${id}.mp3`,
            });
          });
        });

        socket.listen(`/tmp/listen_socket_${id}.mp3`, () => {
          this.logger.log({ message: `Socket created at /tmp/listen_socket_${id}.mp3` });
        });

        return socket;
      })(),
    }));
  }

  private bindSocket(id: number) {
    const index = this.socket.findIndex((_) => _.id === id);
    this.socket[index].isBind = true;
  }

  private unbindSocket(id: number) {
    const index = this.socket.findIndex((_) => _.id === id);
    this.socket[index].isBind = false;
  }

  public stopPlay() {
    this.needStop = true;
  }

  public async play(fsItem: AggregatedFileItem, customEndPosition?: number): Promise<void> {
    const omittedSocket = this.socket.findIndex((_) => _.isBind);
    const freeSocket = this.socket.findIndex((_) => !_.isBind);

    const startPosition = Number(fsItem.timings?.trimStart);
    const endPosition =
      customEndPosition || Number(fsItem.timings?.duration) - Number(fsItem.timings?.trimEnd);
    const filePath = fsItem.path;

    const fadeDuration = config.MPV_FADE_TIME;
    const args = [
      `--no-video --start=${startPosition} --end=${endPosition}`,
      `--af=afade=type=0:duration=${fadeDuration}:start_time=${startPosition},afade=type=1:duration=${fadeDuration}:start_time=${
        endPosition - fadeDuration
      }`,
    ];

    if (config.PLAYING_MODE === 'socket') {
      args.push(`--stream-record=unix:/tmp/listen_socket_${freeSocket}.mp3 -ao=null`);
    }
    args.push(makeSafePath(filePath));
    const childProc = spawn(config.MPV_PATH, args, { shell: true });

    childProc.addListener('spawn', () => {
      if (config.PLAYING_MODE === 'socket') {
        if (omittedSocket !== -1) {
          this.unbindSocket(omittedSocket);
        }

        this.bindSocket(freeSocket);

        this.logger.log({
          message: `Spawned with command: "${childProc.spawnargs.join(
            ' ',
          )}" on socket: "/tmp/listen_socket_${freeSocket}.mp3"`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });
      } else {
        this.logger.log({
          message: `Spawned with command: "${childProc.spawnargs.join(' ')}" pid: ${childProc.pid}`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });
      }
    });

    childProc.addListener('message', (data) =>
      this.logger.log({
        message: `process ${childProc.pid}: ${data.toString()}`,
        level: LogLevel.DEBUG,
        tags: [LogTags.STREAMER, LogTags.MPV],
      }),
    );

    childProc.stdout.on('data', (d) => console.log((d as Buffer).toString()));

    return new Promise((res, rej) => {
      // делаем поллинг для остановки проигрывания
      const polling = setInterval(() => {
        if (!this.needStop) {
          return;
        }

        this.logger.log({
          message: `Catch up user stop request. For: ${filePath}`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });

        this.needStop = false;

        rej('USER_STOP');
        kill(Number(childProc.pid), 'SIGKILL');
        clearInterval(polling);
      }, 50);

      // делаем резолв раньше времени, чтобы можно было организовать миксинг треков без лишних костыликов
      // дропаем поллинг, это важно
      if (fadeDuration) {
        setTimeout(() => {
          clearInterval(polling);
          res();
        }, (endPosition - fadeDuration) * 1000);
      }

      childProc.addListener('exit', (e) => {
        this.logger.log({
          message: `Exit code: ${e} for: ${filePath}`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });

        clearInterval(polling);
        res();
      });
    });
  }
}
