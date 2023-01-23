import { ScheduleItem } from '@prisma/client';
import { secondsInDay } from 'date-fns';

import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';
import { ManualPlaylist } from './PlaylistsManager.ManualPlaylist';
import { Queue } from './Queue';
import { StorageType } from './Storage';
import { currentSecondsFromDayStart, shuffle } from './utils';

export class Scheduler {
  intervals: NodeJS.Timer[] = [];
  currentItem = -1;
  currentPlaylist = -1;
  processing = false;

  constructor(private db: StorageType, private logger: Logger, private queue: Queue) {}

  async getPlaylist(id: number) {
    return this.db.playlists.findFirst({ where: { id } });
  }

  shouldEnd(item: ScheduleItem): boolean {
    return currentSecondsFromDayStart() >= item.endAt && this.currentItem === item.id;
  }

  shouldStart(item: ScheduleItem): boolean {
    return (
      currentSecondsFromDayStart() >= item.startAt &&
      currentSecondsFromDayStart() < item.endAt &&
      this.currentItem !== item.id
    );
  }

  async createItem(startAt: number, endAt: number, playlistIds: string) {
    if (endAt < startAt) {
      if (endAt < 60) {
        return this.db.scheduleItem.create({
          data: {
            endAt: secondsInDay,
            startAt,
            playlistIds,
          },
        });
      } else {
        throw new Error('startAt must be more then endAt');
      }
    }

    return this.db.scheduleItem.create({
      data: {
        endAt,
        startAt,
        playlistIds,
      },
    });
  }

  async deleteItem(id: number) {
    return this.db.scheduleItem.delete({ where: { id } });
  }

  async updateItem(id: number, data: Omit<ScheduleItem, 'id'>) {
    return this.db.scheduleItem.update({ data, where: { id } });
  }

  async getItems() {
    return this.db.scheduleItem.findMany();
  }

  async start() {
    const items = await this.getItems();

    items.map((item) => {
      const interval = setInterval(() => {
        if (this.shouldEnd(item)) {
          this.logger.log({
            message: `Stopping playlist #${this.currentPlaylist}`,
            level: LogLevel.INFO,
            tags: [LogTags.SCHEDULER],
          });

          // Small delay should help avoid race condition
          setTimeout(() => {
            this.currentItem = -1;
            this.currentPlaylist = -1;
          }, 250);
        }

        if (this.shouldStart(item)) {
          // Don't start until something playing
          if (this.currentItem !== -1) {
            return;
          }

          const playlists = item.playlistIds.split(',').map((_) => Number(_));
          const playlistId = shuffle(playlists)[0]; // pick random pl

          this.logger.log({
            message: `Starting playlist #${playlistId}`,
            level: LogLevel.INFO,
            tags: [LogTags.SCHEDULER],
          });
          const pl = new ManualPlaylist(this.db, playlistId);

          pl.getContent().then(async (tracks) => {
            this.currentItem = item.id;
            this.currentPlaylist = playlistId;

            const scheduleDuration = item.endAt - item.startAt;
            const shuffled = shuffle(tracks);
            let durationAccumulator = 0;

            for (const track of shuffled) {
              if (durationAccumulator > scheduleDuration) {
                return;
              }

              const file = await this.db.fSItem.findFirst({ where: { filehash: track.filehash } });
              if (file) {
                durationAccumulator += file.duration;
                this.queue.add(track.filehash, item.endAt, playlistId);
              }
            }
          });
        }
      }, 250);

      this.intervals.push(interval);
    });

    this.processing = true;
  }

  stop() {
    this.intervals.forEach((_) => clearInterval(_));
    this.intervals = [];
    this.currentItem = -1;

    this.processing = false;
  }
}
