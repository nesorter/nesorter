import type { PlaylistItem } from '@prisma/client';
import { FormInstance } from 'antd';
import { map, onMount } from 'nanostores';

import { api } from '@/client/api';
import {
  DirTree,
  findFirstChildnessKey,
  getDirChainItemByKey,
  getDirKeyByFilehash,
  getDirTreeRecursively,
} from '@/client/utils/recursiveTrees';
import type { AggregatedPlaylistItem, ChainItem } from '@/radio-service/types';
import { DtoUpdatePlaylist } from '@/radio-service/types';

export type TStorePlaylistsPage = {
  isCreatingPlaylist: boolean;
  isCreatingInProgress: boolean;
  isEditingInProgress: boolean;
  currentEditingPlaylist: number;
  transferSelected: string[];

  chain: ChainItem[];
  playlists: AggregatedPlaylistItem[];
  playlistItems?: PlaylistItem[];
  currentPlaylist?: AggregatedPlaylistItem;

  transferTree: DirTree[];
  directoriesTree: DirTree[];
};

export const StorePlaylistsPage = map<TStorePlaylistsPage>({
  isCreatingPlaylist: false,
  isCreatingInProgress: false,
  isEditingInProgress: false,
  currentEditingPlaylist: -1,
  transferSelected: [],

  chain: [],
  playlists: [],
  playlistItems: undefined,
  currentPlaylist: undefined,

  transferTree: [],
  directoriesTree: [],
});

export const setIsCreatingPlaylist = (flag: boolean) => {
  StorePlaylistsPage.setKey('isCreatingPlaylist', flag);
};

export const setIsCreatingInProgress = (flag: boolean) => {
  StorePlaylistsPage.setKey('isCreatingInProgress', flag);
};

export const setIsEditingInProgress = (flag: boolean) => {
  StorePlaylistsPage.setKey('isEditingInProgress', flag);
};

export const setCurrentEditingPlaylist = (id: number) => {
  const { playlists } = StorePlaylistsPage.get();
  StorePlaylistsPage.setKey('currentEditingPlaylist', id);
  StorePlaylistsPage.setKey(
    'currentPlaylist',
    playlists?.find((_) => _.id === id),
  );

  if (id !== -1) {
    api.playlistsManager
      .getPlaylist(id)
      .then((_) => StorePlaylistsPage.setKey('playlistItems', _.data))
      .catch(() => StorePlaylistsPage.setKey('playlistItems', []));
  } else {
    StorePlaylistsPage.setKey('playlistItems', []);
  }
};

export const setTransferSelected = (selected: string[]) => {
  StorePlaylistsPage.setKey('transferSelected', selected);
};

export const handleEditPlaylist = (id: number, editForm: FormInstance) => {
  setCurrentEditingPlaylist(id);

  const { playlists, chain } = StorePlaylistsPage.get();
  const playlist = (playlists || []).find((value) => value.id === id);

  editForm.setFieldValue('name', playlist?.name);
  editForm.setFieldValue('type', playlist?.type);
  editForm.setFieldValue(
    'directory',
    getDirKeyByFilehash(chain, (playlist?.fsMeta || [])[0]?.fileItemHash || '')?.key,
  );
};

export const handleCancelEditing = (editForm: FormInstance) => {
  setCurrentEditingPlaylist(-1);
  editForm.resetFields();
};

export const handleEditPlaylistFromModal = (
  data: { name: string; directory: string },
  editForm: FormInstance,
) => {
  const { currentPlaylist, transferSelected, chain } = StorePlaylistsPage.get();

  if (!currentPlaylist) {
    return;
  }

  setIsEditingInProgress(true);

  const dto: DtoUpdatePlaylist = {
    playlistData: {
      name: data.name,
      baseDirectory: '',
    },
    items: [],
  };

  if (currentPlaylist.type === 'fs') {
    dto.playlistData.baseDirectory =
      getDirChainItemByKey(chain, data.directory)?.fsItem?.filehash || undefined;
  }

  if (currentPlaylist.type === 'manual') {
    dto.items = transferSelected.map((tsItem, index) => ({
      order: index + 1,
      filehash: chain.find((_) => _.key === tsItem)?.fsItem?.filehash || '',
    }));
  }

  api.playlistsManager
    .updatePlaylist(currentPlaylist.id, dto)
    .catch(console.error)
    .finally(() => {
      setCurrentEditingPlaylist(-1);
      setIsEditingInProgress(false);
      setTransferSelected([]);
      editForm.resetFields();

      return initPlaylists();
    });
};

export const handleCreatePlaylist = () => setIsCreatingPlaylist(true);

export const handleCancelCreatePlaylist = (createForm: FormInstance) => {
  setIsCreatingPlaylist(false);
  createForm.resetFields();
};

export const handleCreatePlaylistFromModal = (
  data: {
    directory: string;
    name: string;
    type: 'fs' | 'manual';
  },
  createForm: FormInstance,
) => {
  const { chain } = StorePlaylistsPage.get();
  setIsCreatingInProgress(true);
  const filehash = getDirChainItemByKey(chain, data.directory)?.fsItem?.filehash || undefined;

  api.playlistsManager
    .createPlaylist(data.name, data.type, filehash)
    .catch(console.error)
    .finally(() => {
      setIsCreatingPlaylist(false);
      setIsCreatingInProgress(false);
      createForm.resetFields();

      return initPlaylists();
    });
};

export const initPlaylists = async () => {
  const playlists = await api.playlistsManager.getPlaylists().then((items) => items.data);
  StorePlaylistsPage.setKey('playlists', playlists);
};

const initChain = async () => {
  const chainRaw = await api.scanner.getChain().then((_) => _.data);
  const chain = Object.values(chainRaw);
  StorePlaylistsPage.setKey('chain', chain);

  const firstChildnessChainItemKey = findFirstChildnessKey(chain);
  const transferTree = getDirTreeRecursively(
    chain.filter((_) => _.fsItem?.type !== 'dir'),
    1,
    firstChildnessChainItemKey,
  );
  const directoriesTree = getDirTreeRecursively(
    chain.filter((_) => _.type === 'dir'),
    0,
  );

  StorePlaylistsPage.setKey('transferTree', transferTree);
  StorePlaylistsPage.setKey('directoriesTree', directoriesTree);
};

const initStore = async () => {
  await initChain();
  await initPlaylists();
};

onMount(StorePlaylistsPage, () => {
  initStore().catch(console.error);
});
