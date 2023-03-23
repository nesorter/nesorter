import type {
  AggregatedFileItem,
  AggregatedPlaylistItem,
  AggregatedScheduleItem,
  IcecastStatus,
  QueueInstanceState,
} from '@/radio-service/types';

export type ServiceStatus = {
  scheduling?: boolean;
  playing?: boolean;
  syncing?: boolean;
  streaming?: boolean;
  steamUrl?: string;

  fileData?: AggregatedFileItem;
  currentFile?: string;
  thumbnailPath?: string;

  queue?: QueueInstanceState;
  schedulingData?: AggregatedScheduleItem;
  playlistData?: AggregatedPlaylistItem;
  currentPlaylistId?: number;
  icecastData?: IcecastStatus;
};
