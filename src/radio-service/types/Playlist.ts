import { Playlist, PlaylistFsMeta, PlaylistManualMeta } from '@prisma/client';

export type AggregatedPlaylistItem = Playlist & {
  fsMeta: PlaylistFsMeta | null;
  manualMeta: PlaylistManualMeta | null;
};
