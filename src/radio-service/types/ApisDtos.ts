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
