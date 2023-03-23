import type { Playlist, PlaylistFsMeta, PlaylistManualMeta } from '@prisma/client';

import type { AbstractPlaylistUpdateItem } from '@/radio-service/lib/PlaylistsManager.AbstractPlaylist';

export type AggregatedPlaylistItem = Playlist & {
  fsMeta: PlaylistFsMeta[] | null;
  manualMeta: PlaylistManualMeta | null;
};

export type DtoUpdatePlaylist = {
  playlistData: {
    name?: string;
    baseDirectory?: string;
  };
  items: AbstractPlaylistUpdateItem[];
};
