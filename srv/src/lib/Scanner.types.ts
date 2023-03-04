import { FileItem, FileItemMetadata, FileItemTimings } from '@prisma/client';

export type ScannedItem = {
  path: string;
  name: string;
  size: number;
  hash?: string;
  duration?: number;
  id3?: {
    artist: string;
    title: string;
  };
  isDir: boolean;
  isFile: boolean;
};

export type AggregatedFileItem = FileItem & { metadata: FileItemMetadata | null } & {
  timings: FileItemTimings | null;
};

export type Chain = Record<
  string,
  {
    type: 'file' | 'dir';
    path?: string;
    key: string;
    parent: string | null;
    name: string;
    fsItem?: AggregatedFileItem;
    isClassified?: boolean;
  }
>;
