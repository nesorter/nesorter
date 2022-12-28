import { Logger } from "../Logger";
import { ManualPlaylist } from "../PlaylistsManager/Manual";
import { StorageType } from "../Storage";
import { Streamer } from "../Streamer";
import { secondsInDay, differenceInSeconds, endOfDay } from "date-fns";
import { LogLevel, LogTags } from "../Logger/types";
import { ScheduleItem } from "@prisma/client";
import { shuffle } from '../utils';

const getSamaraDate = () => (new Date((new Date()).setHours(new Date().getHours() + 4)));

export class Scheduler {
  intervals: NodeJS.Timer[] = [];
  currentItem = -1;
  currentPlaylist = -1;
  processing: boolean = false;

  constructor(private db: StorageType, private logger: Logger, private streamer: Streamer) {}

  get currentSecondsFromDayStart() {
    return secondsInDay - differenceInSeconds(endOfDay(getSamaraDate()), getSamaraDate());
  }

  async getPlaylist(id: number) {
    return this.db.playlists.findFirst({ where: { id } });
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

    items.map(item => {
      const interval = setInterval(() => {
        if (this.shouldEnd(item)) {
          this.logger.log({ message: `Stopping playlist #${this.currentPlaylist}`, level: LogLevel.INFO, tags: [LogTags.SCHEDULER] });
          this.streamer.stopPlay();

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

          const playlists = item.playlistIds.split(',').map(_ => Number(_));
          const playlistId = shuffle(playlists)[0]; // pick random pl

          this.logger.log({ message: `Starting playlist #${playlistId}`, level: LogLevel.INFO, tags: [LogTags.SCHEDULER] });
          const pl = new ManualPlaylist(this.db, playlistId);

          pl.getContent().then((tracks) => {
            this.currentItem = item.id;
            this.currentPlaylist = playlistId;
            this.streamer.runPlaylist(tracks.map(_ => _.filehash), playlistId.toString());
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
