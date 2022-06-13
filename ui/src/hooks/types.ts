export type ClassificationCategory = {
  id: number;
  name: string;
  values: string[];
}

export type FSItem = {
  filehash: string;
  path: string;
  name: string;
  type: 'file' | 'dir';
  id3Artist: string;
  id3Title: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
};

export type ChainItem = {
  type: 'file' | 'dir';
  key: string;
  parent: string | null;
  name: string;
  fsItem?: FSItem;
};

export type Chain = Record<string, ChainItem>;

export type QueueItem = {
  id: number
  queueId: number
  order: number
  filehash: string
};

export type QueueType = {
  id: number;
  name: string;
  type: 'manual' | 'smart';
};
