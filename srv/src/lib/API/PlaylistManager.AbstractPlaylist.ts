import { ManualPlaylistItem } from '@prisma/client';

export type AbstractPlaylistUpdateItem = {
  order: number;
  filehash: string;
};

export interface AbstractPlaylist {
  update(items: AbstractPlaylistUpdateItem[]): Promise<void>;
  delete(): Promise<void>;
  getContent(): Promise<ManualPlaylistItem[]>;
}
