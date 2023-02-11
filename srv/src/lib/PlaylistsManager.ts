import { Logger } from './Logger';
import { StorageType } from './Storage';

export class PlaylistsManager {
  constructor(private db: StorageType, private logger: Logger) {}

  async createQueue(name: string, type: 'manual' | 'fs', filehash?: string) {
    return await this.db.playlists.create({
      data: {
        name,
        type,
        filehash,
      },
    });
  }

  async getQueues() {
    return this.db.playlists.findMany();
  }
}
