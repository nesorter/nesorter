import config from 'lib/config';
import { Player } from 'lib/Player';
import { StorageType } from 'lib/Storage';
import { currentSecondsFromDayStart, sleep } from 'lib/utils';

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

  constructor(private db: StorageType, private player: Player) {
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
      this.currentOrder = item.order;
      this.currentPlaylistId = item.playlistId;
      const file = await this.db.fSItem.findFirst({ where: { filehash: item.fileHash } });
      if (file) {
        const endPosition = item.endAt - item.startAt;
        this.player.play(file, endPosition);
      }
    }

    sleep(250);

    setTimeout(() => {
      this.runLoop();
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
    this.runLoop();
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
    const file = await this.db.fSItem.findFirst({ where: { filehash: fileHash } });
    if (!file) {
      throw new Error('Wrong fileHash');
    }

    const lastItem = this.items.at(-1);
    let stopAddSignal = false;
    let startAt = currentSecondsFromDayStart();
    let endAt = startAt + file.duration;

    if (lastItem) {
      startAt = lastItem.endAt - config.MPV_FADE_TIME;
      endAt = startAt + file.duration;
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
