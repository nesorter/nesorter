import { AbstractPlaylist } from './API/PlaylistManager.AbstractPlaylist';
import { Logger } from './Logger';
import { FSPlaylist } from './PlaylistsManager.FSPlaylist';
import { ManualPlaylist } from './PlaylistsManager.ManualPlaylist';
import { Scanner } from './Scanner';
import { StorageType } from './Storage';

export class PlaylistsManager {
  constructor(private db: StorageType, private logger: Logger, private scanner: Scanner) {}

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

  async getQueueInstance(id: number): Promise<AbstractPlaylist> {
    const record = await this.db.playlists.findFirst({ where: { id } });
    if (!record) {
      throw new Error('no such pl');
    }

    if (record.type === 'manual') {
      return new ManualPlaylist(this.db, id);
    }

    return new FSPlaylist(this.db, id, this.scanner);
  }
}
