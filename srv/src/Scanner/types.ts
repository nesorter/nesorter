import { FSItem, FSItemMeta } from '@prisma/client';

export type ScannedItem = {
  path: string,
  name: string,
  size: number,
  hash?: string,
  id3?: {
    artist: string;
    title: string;
  },
  isDir: boolean,
  isFile: boolean
};

export type Chain = Record<string, {
  type: 'file' | 'dir';
  key: string;
  parent: string | null;
  name: string;
  fsItem?: FSItem;
  fsItemMeta?: FSItemMeta;
}>;