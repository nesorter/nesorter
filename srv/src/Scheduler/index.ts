import { Logger } from "../Logger";
import { ManualPlaylist } from "../PlaylistsManager/Manual";
import { StorageType } from "../Storage";
import { Streamer } from "../Streamer";
import { secondsInDay, differenceInSeconds, endOfDay } from "date-fns";
import { LogLevel, LogTags } from "../Logger/types";
import { ScheduleItem } from "@prisma/client";

export class Scheduler {
  intervals: NodeJS.Timer[] = [];
  currentItem = -1;
  processing: boolean = false;

  constructor(private db: StorageType, private logger: Logger, private streamer: Streamer) {}

  get currentSecondsFromDayStart() {
    return secondsInDay - differenceInSeconds(endOfDay(new Date()), new Date());
  }

  shouldEnd(item: ScheduleItem): boolean {
    return this.currentSecondsFromDayStart >= item.endAt 
      && this.currentItem === item.id;
  }

  shouldStart(item: ScheduleItem): boolean {
    return this.currentSecondsFromDayStart >= item.startAt
      && this.currentSecondsFromDayStart < item.endAt
      && this.currentItem !== item.id;
  }

  async createItem(startAt: number, endAt: number, playlistId: number) {
    if (endAt < startAt) {
      if (endAt < 60) {
        return this.db.scheduleItem.create({
          data: {
            endAt: secondsInDay,
            startAt,
            playlistId,
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
        playlistId,
      },
    });
  }

  async deleteItem(itemId: number) {
    return this.db.scheduleItem.delete({ where: { id: itemId } });
  }

  async getItems() {
    return this.db.scheduleItem.findMany();
  }

  async start() {
    const items = await this.getItems();

    items.map(item => {
      const interval = setInterval(() => {
        if (this.shouldEnd(item)) {
          this.logger.log({ message: `Stopping playlist #${item.playlistId}`, level: LogLevel.INFO, tags: [LogTags.SCHEDULER] });
          this.streamer.stopPlay();

          // Small delay should help avoid race condition
          setTimeout(() => {
            this.currentItem = -1;
          }, 250);
        }

        if (this.shouldStart(item)) {
          // Dont start until something playing
          if (this.currentItem !== -1) {
            return;
          }

          this.logger.log({ message: `Starting playlist #${item.playlistId}`, level: LogLevel.INFO, tags: [LogTags.SCHEDULER] });
          const pl = new ManualPlaylist(this.db, item.playlistId);

          pl.getContent().then((tracks) => {
            this.currentItem = item.id;
            this.streamer.runPlaylist(tracks.map(_ => _.filehash), item.playlistId.toString());
          });
        }
      }, 250);

      this.intervals.push(interval);
    });

    this.processing = true;
  }

  async stop() {
    this.intervals.forEach(_ => clearInterval(_));
    this.intervals = [];
    this.currentItem = -1;

    this.processing = false;
  }
}
