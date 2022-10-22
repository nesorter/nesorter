import { createServer, Server, Socket } from 'net';
import Config from '../config';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { Logger } from '../Logger';
import { LogLevel, LogTags } from '../Logger/types';
import { spawn, exec } from 'child_process';
import { asyncSpawn, getRandomArbitrary, makeSafePath, range, shuffle } from '../utils';
import config from '../config';
import { Scanner } from "../Scanner";
import { FSItem } from '@prisma/client';
import axios from 'axios';

const kill = require('tree-kill');

export class Streamer {
  currentPlaylistId?: string;
  currentFile?: string;
  playing = false;

  needStop = false;
  ffmpeg?: FfmpegCommand;

  socket: { id: number, instanse: Server, binded: boolean }[] = [];
  outputSocket?: Socket;
  counter = 0;

  constructor(private logger: Logger, private scanner: Scanner) {
    logger.log({
      message: `PLAYING_MODE is '${config.PLAYING_MODE}'. ${config.PLAYING_MODE === 'socket' ? 'Init sockets' : 'Skip init socket'}`
    });

    if (config.PLAYING_MODE === 'socket') {
      this.initSockets();
    }
  }

  async initSockets() {
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

  bindSocket(id: number) {
    const index = this.socket.findIndex(_ => _.id === id);
    this.socket[index].binded = true;
  }

  unbindSocket(id: number) {
    const index = this.socket.findIndex(_ => _.id === id);
    this.socket[index].binded = false;
  }

  get streaming(): boolean {
    return this.ffmpeg !== undefined;
  }

  async publishMetadata(fsitem: FSItem): Promise<void> {
    await axios.get(`http://${config.SHOUT_HOST}:${config.SHOUT_PORT}/admin/metadata`, {
      params: {
        song: `${fsitem.id3Artist} - ${fsitem.id3Title}`,
        mount: `/${config.SHOUT_MOUNT}`,
        mode: 'updinfo',
      },
      auth: {
        username: config.SHOUT_ADMIN_USER,
        password: config.SHOUT_ADMIN_PASSWORD,
      },
    });
  }

  playFile(filePath: string, startPosition = 5, endPosition = 25): Promise<void> {
    const omitedSocket = this.socket.findIndex(_ => _.binded === true);
    const freeSocket = this.socket.findIndex(_ => _.binded === false);

    const fadeDuration = Config.MPV_FADE_TIME;
    const args = [
      `--no-video --start=${startPosition} --end=${endPosition}`,
      `--af=afade=type=0:duration=${fadeDuration}:start_time=${startPosition},afade=type=1:duration=${fadeDuration}:start_time=${endPosition - fadeDuration}`,
      config.PLAYING_MODE === 'socket' ? `--stream-record=unix:/tmp/listen_socket_${freeSocket}.mp3 -ao=null` : undefined,
      makeSafePath(filePath)
    ].filter(_ => _ !== undefined) as string[];

    const childProc = spawn(config.MPV_PATH, args, { shell: true });

    childProc.addListener('spawn', () => {
      if (config.PLAYING_MODE === 'socket') {
        if (omitedSocket !== -1) {
          this.unbindSocket(omitedSocket);
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

  stopStream() {
    if (!this.streaming) {
      return;
    }

    this.ffmpeg?.kill('SIGKILL');
    this.ffmpeg = undefined;
  }

  stopPlay() {
    this.needStop = true;
  }

  async startStream() {
    if (this.streaming) {
      throw new Error('Stream already in progress!');
    }

    const input = config.PLAYING_MODE === 'socket'
      ? 'unix:/tmp/output_socket.mp3'
      : config.HARDWARE_PLAYER_FFMPEG_DEVICE;

    const instance = ffmpeg()
      .input(input)
      .addInputOption(['-re', '-stream_loop -1'])
      .audioCodec(config.FFMPEG_CODEC)
      .audioBitrate(config.FFMPEG_BITRATE)
      .addOutputOption([
        `-content_type ${config.FFMPEG_CONTENT_TYPE}`,
        '-map 0',
        '-map_metadata 0:s:0',
      ])
      .outputFormat(config.FFMPEG_OUTPUT_FORMAT)
      .output(`icecast://${Config.SHOUT_USER}:${Config.SHOUT_PASSWORD}@${Config.SHOUT_HOST}:${Config.SHOUT_PORT}/${Config.SHOUT_MOUNT}`);

    if (config.PLAYING_MODE === 'hardware') {
      instance.inputFormat(config.HARDWARE_PLAYER_FFMPEG_DRIVER);
    }

    instance.on('error', (err) => {
      this.logger.log({ message: `Stream errored: ${err.message}`, level: LogLevel.ERROR, tags: [LogTags.STREAMER, LogTags.FFMPEG] });
      this.stopStream();

      if (!err.message.includes('SIGKILL')) {
        this.startStream();
      }
    });

    instance.on('progress', (progressData) => {
      this.counter = this.counter + 1;

      if (this.counter === 25) {
        this.counter = 0;
        this.logger.log({ message: `FFMpeg info`, extraData: progressData, level: LogLevel.INFO, tags: [LogTags.FFMPEG] });
      }
    });

    instance.once('end', () => {
      this.logger.log({ message: `Stream ended`, level: LogLevel.INFO, tags: [LogTags.STREAMER] });
      this.stopStream();
    });

    instance.once('start', (commandLine) => {
      this.logger.log({ message: `Spawned with command: "${commandLine}"`, level: LogLevel.DEBUG, tags: [LogTags.STREAMER, LogTags.FFMPEG] });
    });

    this.ffmpeg = instance;
    instance.run();
  }

  async runPlaylists(playlists: { hashes: string[], playlistId: string }[]) {
    this.playing = true;

    // Да, вот такой вот infinite loop c рандомным порядком :^)
    for (let i = 1; i <= Number.MAX_SAFE_INTEGER; i++) {
      const shuffled = shuffle([...playlists]);

      for (let playlist of shuffled) {
        this.currentPlaylistId = playlist.playlistId;
        this.logger.log({ message: 'Start playlist', extraData: { plId: playlist.playlistId } });

        for (let fileHash of playlist.hashes) {
          this.logger.log({ message: 'Playing', extraData: { fileHash } });

          try {
            const fileData = await this.scanner.getFsItem(fileHash);
  
            if (fileData) {
              this.currentFile = fileData.filehash;
  
              setTimeout(() => this.publishMetadata(fileData), 2000);
              await this.playFile(
                fileData.path,
                fileData.trimStart,
                fileData.duration - fileData.trimEnd
              );
            }
          } catch (e) {
            console.log((e as any).message);
  
            if (e === 'USER_STOP') {
              this.playing = false;
              this.currentPlaylistId = undefined;
              this.currentFile = undefined;
              return;
            }
          }
        }        
      }
    }

    this.playing = false;
    this.currentPlaylistId = undefined;
    this.currentFile = undefined;
  }

  async runPlaylist(hashes: string[], playlistId?: string) {
    this.playing = true;
    this.currentPlaylistId = playlistId;

    // Да, вот такой вот infinite loop c рандомным порядком :^)
    for (let i = 1; i <= Number.MAX_SAFE_INTEGER; i++) {
      const shuffled = shuffle([...hashes]);

      for (let fileHash of shuffled) {
        this.logger.log({ message: 'Playing', extraData: { fileHash } });

        try {
          const fileData = await this.scanner.getFsItem(fileHash);

          if (fileData) {
            this.currentFile = fileData.filehash;

            setTimeout(() => this.publishMetadata(fileData), 2000);
            await this.playFile(
              fileData.path,
              fileData.trimStart,
              fileData.duration - fileData.trimEnd
            );
          }
        } catch (e) {
          console.log((e as any).message);

          if (e === 'USER_STOP') {
            this.playing = false;
            this.currentPlaylistId = undefined;
            this.currentFile = undefined;
            return;
          }
        }
      }
    }

    this.playing = false;
    this.currentPlaylistId = undefined;
    this.currentFile = undefined;
  }
}
