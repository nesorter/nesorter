import { PlaylistItem } from '@prisma/client';

export type AbstractPlaylistUpdateItem = {
  order: number;
  filehash: string;
};

export interface AbstractPlaylist {
  update(items: AbstractPlaylistUpdateItem[]): Promise<void>;
  delete(): Promise<void>;
  invalidateCache(): Promise<void>;
  getContent(): Promise<PlaylistItem[]>;
}
