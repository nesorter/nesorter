import { PlaylistsOnScheduleItem, ScheduleItem } from '@prisma/client';

import { AggregatedPlaylistItem } from '@/radio-service/types/Playlist';

export type AggregatedSchedulePlaylistItem = PlaylistsOnScheduleItem & {
  playlist: AggregatedPlaylistItem;
};

export type AggregatedScheduleItem = ScheduleItem & {
  playlists: AggregatedSchedulePlaylistItem[];
};
