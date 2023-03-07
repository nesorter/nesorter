import { AbstractPlaylist } from './API/PlaylistManager.AbstractPlaylist';
import { Logger } from './Logger';
import { FSPlaylist } from './PlaylistsManager.FSPlaylist';
import { ManualPlaylist } from './PlaylistsManager.ManualPlaylist';
import { Scanner } from './Scanner';
import { StorageType } from './Storage';

export class PlaylistsManager {
  constructor(private db: StorageType, private logger: Logger, private scanner: Scanner) {}

  async createQueue(name: string, type: 'manual' | 'fs', filehash?: string) {
    if (type === 'fs') {
      return await this.db.playlist.create({
        data: {
          name,
          type,
          fsMeta: {
            create: {
              fileItemHash: filehash,
            },
          },
        },
      });
    } else if (type === 'manual') {
      return await this.db.playlist.create({
        data: {
          name,
          type,
        },
      });
    }
  }

  async getQueues() {
    return this.db.playlist.findMany({
      include: {
        fsMeta: true,
        manualMeta: {
          include: {
            playlistItems: true,
          },
        },
      },
    });
  }

  async getQueueInstance(id: number): Promise<AbstractPlaylist> {
    const record = await this.db.playlist.findFirst({ where: { id } });

    if (!record) {
      throw new Error('no such pl');
    }

    if (record.type === 'manual') {
      return new ManualPlaylist(this.db, id);
    }

    return new FSPlaylist(this.db, id, this.scanner);
  }
}
