import { Logger } from "lib/Logger";
import { StorageType } from "lib/Storage";

export class PlaylistsManager {
  constructor (private db: StorageType, private logger: Logger) {}

  async createQueue(name: string, type: 'manual' | 'smart') {
    return await this.db.playlists.create({
      data: {
        name,
        type,
      },
    });
  }

  async getQueues() {
    return this.db.playlists.findMany();
  }
}
