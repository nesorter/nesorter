import * as Sentry from '@sentry/node';

import config from './config';
import { Player } from './Player';
import { Publisher } from './Publisher';
import { StorageType } from './Storage';
import { currentSecondsFromDayStart, sleep } from './utils';

export type QueueItem = {
  order: number;
  fileHash: string;
  playlistId?: number;
  startAt: number;
  endAt: number;
};

export type QueueState = 'stopped' | 'playing';

export class Queue {
  public items: QueueItem[] = [];
  public currentOrder: number | null = null;
  public currentPlaylistId: number | undefined = undefined;
  private internalOrder = 0;
  public state: QueueState = 'stopped';

  constructor(private db: StorageType, private player: Player, private publisher: Publisher) {
    this.runCleanupLoop();
  }

  private runCleanupLoop() {
    const currentSeconds = currentSecondsFromDayStart();
    this.items = this.items.filter((_) => _.endAt + config.MPV_FADE_TIME + 1 > currentSeconds);

    setTimeout(() => this.runCleanupLoop(), 1000);
  }

  private async runLoop() {
    if (this.state === 'stopped') {
      return;
    }

    const currentSeconds = currentSecondsFromDayStart();
    const item = this.items.find((_) => _.startAt <= currentSeconds && _.endAt >= currentSeconds);

    if (item && item?.order !== this.currentOrder) {
      const file = await this.db.fileItem.findFirstOrThrow({
        where: { filehash: item.fileHash },
        include: {
          timings: true,
          metadata: true,
        },
      });

      if (file) {
        this.currentOrder = item.order;
        this.currentPlaylistId = item.playlistId;
        const endPosition = item.endAt - item.startAt;
        this.player.play(file, endPosition).catch(Sentry.captureException);

        await sleep(250);
        this.publisher.publish(file).catch(Sentry.captureException);
      }
    }

    await sleep(250);

    setTimeout(() => {
      this.runLoop().catch(Sentry.captureException);
    }, 250);
  }

  public get currentFileHash() {
    return this.items.find((_) => _.order === this.currentOrder)?.fileHash;
  }

  public clear() {
    this.items = this.items.filter((_) => _.order === this.currentOrder);
  }

  public play() {
    this.state = 'playing';
    this.runLoop().catch(Sentry.captureException);
  }

  public stop() {
    this.state = 'stopped';
    this.currentOrder = null;
    this.player.stopPlay();
  }

  public async add(
    fileHash: string,
    hardEndAt: number | undefined,
    playlistId: number | undefined,
  ) {
    const file = await this.db.fileItem.findFirstOrThrow({
      where: { filehash: fileHash },
      include: {
        timings: true,
        metadata: true,
      },
    });

    if (!file) {
      throw new Error('Wrong fileHash');
    }

    const lastItem = this.items.at(-1);
    let stopAddSignal = false;
    let startAt = currentSecondsFromDayStart();
    let endAt = startAt + Number(file.timings?.duration);

    if (lastItem) {
      startAt = lastItem.endAt - config.MPV_FADE_TIME;
      endAt = startAt + Number(file.timings?.duration);
    }

    if (hardEndAt) {
      if (endAt > hardEndAt) {
        endAt = hardEndAt;
        stopAddSignal = true;
      }
    }

    this.internalOrder += 1;
    this.items.push({
      order: Number(this.internalOrder),
      fileHash,
      playlistId,
      startAt,
      endAt,
    });

    return stopAddSignal;
  }
}
