import type { PlaylistItem } from '@prisma/client';

import type { DtoUpdatePlaylist } from '@/radio-service/types';

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
