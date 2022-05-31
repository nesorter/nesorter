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
};

export type FSItemMeta = {
  filehash: string;
  id3Artist: string;
  id3Title: string;
}

export type ChainItem = {
  type: 'file' | 'dir';
  key: string;
  parent: string | null;
  name: string;
  fsItem?: FSItem;
  fsItemMeta?: FSItemMeta;
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
