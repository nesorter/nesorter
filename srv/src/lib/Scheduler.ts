import { PlaylistItem, ScheduleItem } from '@prisma/client';
import { secondsInDay } from 'date-fns';

import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';
import { PlaylistsManager } from './PlaylistsManager';
import { Queue } from './Queue';
import { StorageType } from './Storage';
import { currentSecondsFromDayStart, getRandomArbitrary, shuffle } from './utils';

export class Scheduler {
  intervals: NodeJS.Timer[] = [];
  currentItem = -1;
  currentPlaylist = -1;
  processing = false;

  constructor(
    private db: StorageType,
    private logger: Logger,
    private queue: Queue,
    private playlistsManager: PlaylistsManager,
  ) {}

  async getPlaylist(id: number) {
    return await this.db.playlist.findFirst({ where: { id } });
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

  async createItem(startAt: number, endAt: number, playlistIds: string, withMerging?: number) {
    const scheduleItemId = (await this.db.scheduleItem.count()) + 1;
    const aggregated = playlistIds
      .split(',')
      .map((_) => Number(_))
      .map((playlistId) => ({
        create: { playlistId },
        where: { scheduleItemId_playlistId: { playlistId, scheduleItemId } },
      }));

    if (endAt < startAt) {
      if (endAt < 60) {
        return this.db.scheduleItem.create({
          data: {
            id: scheduleItemId,
            withMerging: withMerging || 0,
            endAt: secondsInDay,
            startAt,
            playlists: {
              connectOrCreate: aggregated,
            },
          },
        });
      } else {
        throw new Error('startAt must be more then endAt');
      }
    }

    return this.db.scheduleItem.create({
      data: {
        id: scheduleItemId,
        endAt,
        startAt,
        withMerging: withMerging || 0,
        playlists: {
          connectOrCreate: aggregated,
        },
      },
    });
  }

  async deleteItem(id: number) {
    return this.db.scheduleItem.delete({ where: { id } });
  }

  async updateItem(
    id: number,
    data: { endAt: number; startAt: number; withMerging: number; playlistIds: string },
  ) {
    return this.db.scheduleItem.update({
      data: {
        startAt: data.startAt,
        withMerging: data.withMerging,
        endAt: data.endAt,
        playlists: {
          connectOrCreate: data.playlistIds.split(',').map((_) => ({
            where: {
              scheduleItemId_playlistId: {
                scheduleItemId: id,
                playlistId: Number(_),
              },
            },
            create: {
              playlistId: Number(_),
            },
          })),
        },
      },
      where: { id },
    });
  }

  async getItems() {
    return this.db.scheduleItem.findMany({
      include: {
        playlists: { include: { playlist: { include: { fsMeta: true, manualMeta: true } } } },
      },
    });
  }

  async start() {
    const items = await this.getItems();
    for (const item of items) {
      const interval = setInterval(async () => {
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

          const pls = item.playlists.map((_) => _.playlistId).join(',');

          this.logger.log({
            message: `Starting schedule item #${item.id} with PLs ${pls}`,
            level: LogLevel.INFO,
            tags: [LogTags.SCHEDULER],
          });

          const tracks: { playlistId: number; content: PlaylistItem[]; index: number }[] = [];

          for (const playlistInstance of item.playlists) {
            const playlist = await this.playlistsManager.getQueueInstance(
              playlistInstance.playlistId,
            );

            tracks.push({
              playlistId: playlistInstance.playlistId,
              content: shuffle(await playlist.getContent()),
              index: 0,
            });
          }

          let content = tracks[getRandomArbitrary(0, tracks.length - 1)];
          this.currentItem = item.id;
          this.currentPlaylist = content.playlistId;

          let shouldEnd = false;
          while (!shouldEnd) {
            const track = content.content[content.index];
            content.index += 1;

            const file = await this.db.fileItem.findFirst({
              where: { filehash: track.fileItemHash || '' },
            });

            if (file) {
              shouldEnd = await this.queue.add(file.filehash, item.endAt, content.playlistId);
            }

            if (content.content.length - 1 === content.index) {
              content.content = shuffle(content.content);
              content.index = 0;
            }

            if (item.withMerging) {
              content = tracks[getRandomArbitrary(0, tracks.length - 1)];
            }
          }
        }
      }, 1000);

      this.intervals.push(interval);
    }

    this.processing = true;
  }

  stop() {
    this.intervals.forEach((_) => clearInterval(_));
    this.intervals = [];
    this.currentItem = -1;

    this.processing = false;
  }
}
