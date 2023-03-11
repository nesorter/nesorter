import type { PlaylistItem } from '@prisma/client';
import { useQuery } from 'react-query';

import { api } from '@/client/api';
import type { AggregatedPlaylistItem } from '@/radio-service/types/Playlist';

export const usePlaylists = (initialData?: AggregatedPlaylistItem[]) => {
  return useQuery<AggregatedPlaylistItem[]>(
    ['playlists'],
    () => api.playlistsManager.getPlaylists().then((_) => _.data),
    {
      enabled: true,
      initialData: initialData,
    },
  );
};

export const usePlaylistItems = (playlistId: number) => {
  return useQuery<PlaylistItem[]>(
    ['playlists', 'playlist', playlistId],
    () => api.playlistsManager.getPlaylist(playlistId).then((_) => _.data),
    {
      enabled: playlistId !== -1,
    },
  );
};
