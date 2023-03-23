import { AbstractPlaylist, FSPlaylist, ManualPlaylist } from '@/radio-service/PlaylistsManager';
import { Logger } from '@/radio-service/Storage';
import { Scanner } from '@/radio-service/Streamer';
import type { StorageType } from '@/radio-service/types';

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
