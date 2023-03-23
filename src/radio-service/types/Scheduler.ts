import type { PlaylistsOnScheduleItem, ScheduleItem } from '@prisma/client';

import type { AggregatedPlaylistItem } from '@/radio-service/types';

export type AggregatedSchedulePlaylistItem = PlaylistsOnScheduleItem & {
  playlist: AggregatedPlaylistItem;
};

export type AggregatedScheduleItem = ScheduleItem & {
  playlists: AggregatedSchedulePlaylistItem[];
};
