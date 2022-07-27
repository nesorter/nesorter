export type ClassificationCategory = {
  id: number;
  name: string;
  values: string[];
}

export type CreateCategoryDTO = {
  name: string;
  values: string[];
}

export type UpdateCategoryDTO = CreateCategoryDTO & {
  id: number;
}

export type ClassificatedItem = {
  filehash: string;
  categories: ClassificationCategory[];
};

export type GetClassifiedFiltersDTO = Record<string, string | string[]>;

export type FSItem = {
  filehash: string
  path: string
  name: string
  type: string
  id3Artist: string
  id3Title: string
  duration: number
  trimStart: number
  trimEnd: number
}

export type ChainItem = {
  type: 'file' | 'dir';
  key: string;
  parent: string | null;
  name: string;
  isClassified?: boolean;
  fsItem?: FSItem;
};

export type Chain = Record<string, ChainItem>;

export type Playlist = {
  id: number
  name: string
  type: string
}

export type ManualPlaylistItem = {
  id: number;
  playlistId: number;
  order: number;
  filehash: string;
}

export type UpdatePlaylistItemDto = {
  order: number;
  filehash: string;
}[];

export type Status = {
  scheduling: boolean;
  playing: boolean;
  syncing: boolean;
  streaming: boolean;
  currentFile?: string;
  currentPlaylistId?: string;
};

export type SchedulerItem = {
  id: number;
  startAt: number;
  endAt: number;
  playlistId: number;
};
