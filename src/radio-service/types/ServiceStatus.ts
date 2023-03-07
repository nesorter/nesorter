import { IcecastStatus } from '@/radio-service/types/Icecast';
import { AggregatedPlaylistItem } from '@/radio-service/types/Playlist';
import { QueueInstanceState } from '@/radio-service/types/Queue';
import { AggregatedFileItem } from '@/radio-service/types/Scanner';
import { AggregatedScheduleItem } from '@/radio-service/types/Scheduler';

export type ServiceStatus = {
  scheduling?: boolean;
  playing?: boolean;
  syncing?: boolean;
  streaming?: boolean;

  fileData?: AggregatedFileItem;
  currentFile?: string;
  thumbnailPath?: string;

  queue?: QueueInstanceState;
  schedulingData?: AggregatedScheduleItem;
  playlistData?: AggregatedPlaylistItem;
  currentPlaylistId?: number;
  icecastData?: IcecastStatus;
};
