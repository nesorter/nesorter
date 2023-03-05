import {
  ClassCategory,
  ClassedItem,
  ClassItem,
  FileItem,
  FileItemMetadata,
  FileItemTimings,
} from '@prisma/client';

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

export type AggregatedClassedItem = ClassedItem & {
  classItem: ClassItem & { category: ClassCategory };
};

export type AggregatedFileItem = FileItem & { metadata: FileItemMetadata | null } & {
  timings: FileItemTimings | null;
} & { classedItems?: AggregatedClassedItem[] };

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
