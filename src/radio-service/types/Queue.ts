export type QueueItem = {
  order: number;
  fileHash: string;
  playlistId?: number;
  startAt: number;
  endAt: number;
};

export type QueueState = 'stopped' | 'playing';

export type QueueInstanceState = {
  items?: QueueItem[];
  currentOrder?: number;
  state?: QueueState;
};
