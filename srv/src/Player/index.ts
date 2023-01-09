import { Publisher } from './../Publisher';
import { FSItem } from '@prisma/client';
import { Logger } from '../Logger';
import { asyncSpawn, makeSafePath, range } from '../utils';
import { createServer, Server, Socket } from 'net';
import { spawn } from 'child_process';
import { LogLevel, LogTags } from '../Logger/types';
import config from '../config';

const kill = require('tree-kill');

export class Player {
  socket: { id: number, instanse: Server, binded: boolean }[] = [];
  outputSocket?: Socket;
  needStop = false;

  constructor(private logger: Logger, private publisher: Publisher) {
    const logMessage = config.PLAYING_MODE === 'socket' ? 'Init sockets' : 'Skip init socket';
    logger.log({ message: `PLAYING_MODE is '${config.PLAYING_MODE}'. ${logMessage}` });

    if (config.PLAYING_MODE === 'socket') {
      this.initSockets();
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
      instanse: (() => {
        const socket = createServer();

        socket.on('connection', (client) => {
          this.logger.log({ message: `Someone connected to socket /tmp/listen_socket_${id}.mp3` });

          client.on('data', (data) => {
            const self = this.socket.find(_ => _.id === id);

            // Не делаем роутинг в случае когда сокет не используется
            if (!self?.binded) {
              return;
            }

            this.outputSocket?.write(data, () => null);
          });

          client.on('end', () => {
            this.logger.log({ message: `Someone disconnected from socket /tmp/listen_socket_${id}.mp3` });
          });
        });

        socket.listen(`/tmp/listen_socket_${id}.mp3`, () => {
          this.logger.log({ message: `Socket created at /tmp/listen_socket_${id}.mp3` });
        });

        return socket;
      })(),
      binded: false,
    }));
  }

  private bindSocket(id: number) {
    const index = this.socket.findIndex(_ => _.id === id);
    this.socket[index].binded = true;
  }

  private unbindSocket(id: number) {
    const index = this.socket.findIndex(_ => _.id === id);
    this.socket[index].binded = false;
  }

  public stopPlay() {
    this.needStop = true;
  }

  public async play(fsItem: FSItem, customEndPosition?: number): Promise<void> {
    const omittedSocket = this.socket.findIndex(_ => _.binded === true);
    const freeSocket = this.socket.findIndex(_ => _.binded === false);

    const startPosition = fsItem.trimStart;
    const endPosition = customEndPosition || fsItem.duration - fsItem.trimEnd;
    const filePath = fsItem.path;

    const fadeDuration = config.MPV_FADE_TIME;
    const args = [
      `--no-video --start=${startPosition} --end=${endPosition}`,
      `--af=afade=type=0:duration=${fadeDuration}:start_time=${startPosition},afade=type=1:duration=${fadeDuration}:start_time=${endPosition - fadeDuration}`,
    ];

    if (config.PLAYING_MODE === 'socket') {
      args.push(`--stream-record=unix:/tmp/listen_socket_${freeSocket}.mp3 -ao=null`);
    }
    args.push(makeSafePath(filePath));
    const childProc = spawn(config.MPV_PATH, args, { shell: true });

    childProc.addListener('spawn', () => {
      this.publisher.publish(fsItem);

      if (config.PLAYING_MODE === 'socket') {
        if (omittedSocket !== -1) {
          this.unbindSocket(omittedSocket);
        }

        this.bindSocket(freeSocket);

        this.logger.log({
          message: `Spawned with command: "${childProc.spawnargs.join(' ')}" on socket: "/tmp/listen_socket_${freeSocket}.mp3"`,
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

    childProc.addListener('message', (data) => this.logger.log({
      message: `process ${childProc.pid}: ${data.toString()}`,
      level: LogLevel.DEBUG,
      tags: [LogTags.STREAMER, LogTags.MPV],
    }));

    childProc.stdout.on('data', d => console.log(d.toString()));

    return new Promise((res, rej) => {
      // делаем поллинг для остановки проигрывания
      const polling = setInterval(() => {
        if (!this.needStop)  {
          return;
        }

        this.logger.log({
          message: `Catch up user stop request. For: ${filePath}`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });

        this.needStop = false;

        rej('USER_STOP');
        kill(childProc.pid, 'SIGKILL');
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
          message: `Exitcode: ${e} for: ${filePath}`,
          level: LogLevel.DEBUG,
          tags: [LogTags.STREAMER, LogTags.MPV],
        });

        clearInterval(polling);
        res();
      });
    });
  }
}
