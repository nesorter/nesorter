import { PlaylistItem } from '@prisma/client';

import { DtoUpdatePlaylist } from '@/radio-service/types/Playlist';

export type AbstractPlaylistUpdateItem = {
  order: number;
  filehash: string;
};

export interface AbstractPlaylist {
  update(dto: DtoUpdatePlaylist): Promise<void>;
  delete(): Promise<void>;
  invalidateCache(): Promise<void>;
  getContent(): Promise<PlaylistItem[]>;
}
