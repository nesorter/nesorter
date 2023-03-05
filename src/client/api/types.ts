export type DtoUpsertCategory = {
  id?: number;
  name: string;
  values: { id?: number; value: string }[];
};

export type DtoUpsertFileItem = {
  filehash: string;
  classItemsIds: number[];
};

export type DtoUpdatePlaylistItem = {
  order: number;
  filehash: string;
}[];

export type DtoGetClassifiedFilters = Record<string, string | string[]>;

export type ClassedItem = {
  id: number;
  classItemId: number;
  fileHash: string;
};

export type ClassItem = {
  id: number;
  value: string;
  categoryId: number;
};

export type ClassCategory = {
  id: number;
  name: string;
  items: ClassItem[];
};

export type AggregatedClassedItem = ClassedItem & {
  classItem: ClassItem & { category: ClassCategory };
};

export type FSItem = {
  filehash: string;
  path: string;
  name: string;
  type: 'file' | 'dir';
  metadata: {
    artist: string;
    title: string;
  };
  timings: {
    duration: number;
    trimStart: number;
    trimEnd: number;
  };
  classedItems?: AggregatedClassedItem[];
};

export type ChainItem = {
  type: 'file' | 'dir';
  path?: string;
  key: string;
  parent: string | null;
  name: string;
  isClassified?: boolean;
  fsItem?: FSItem;
};

export type Chain = Record<string, ChainItem>;

export type Playlist = {
  id: number;
  name: string;
  type: 'manual' | 'fs';
};

export type ManualPlaylistItem = {
  id: number;
  playlistId: number;
  order: number;
  fileItemHash: string;
};

export type Status = {
  scheduling: boolean;
  playing: boolean;
  syncing: boolean;
  streaming: boolean;
  currentFile?: string;
  currentPlaylistId?: string;
  queue: {
    items: QueueItem[];
    currentOrder: null | number;
    state: 'stopped' | 'playing';
  };
};

export type QueueItem = {
  order: number;
  fileHash: string;
  startAt: number;
  endAt: number;
};

export type ScheduleItem = {
  id: number;
  withMerging: number;
  startAt: number;
  endAt: number;
  playlists: PlaylistElement[];
};

export type PlaylistElement = {
  scheduleItemId: number;
  playlistId: number;
  playlist: PlaylistPlaylist;
};

export type PlaylistPlaylist = {
  id: number;
  name: string;
  type: string;
  fsMeta?: FSMeta;
  manualMeta?: null;
};

export type FSMeta = {
  id: number;
  fileItemHash: string;
  playlistId: number;
};
