import { FormInstance } from 'antd';
import { map, onMount } from 'nanostores';

import { api } from '@/client/api';
import {
  DirTree,
  findFirstChildnessKey,
  getDirTreeRecursively,
} from '@/client/utils/recursiveTrees';
import type { AggregatedClassCategory, AggregatedFileItem, ChainItem } from '@/radio-service/types';

export type TStoreClassifyPage = {
  categories: AggregatedClassCategory[];
  chain: ChainItem[];
  tree: DirTree[];

  classEditMode: boolean;
  isListening: boolean;

  selectedTrackKey?: string;
  selectedTrack?: ChainItem;
  selectedTrackFileItem?: AggregatedFileItem;

  currentCategoryId: number;

  audio?: HTMLAudioElement;

  categoriesFetch: boolean;
};

export const StoreClassifyPage = map<TStoreClassifyPage>({
  categories: [],
  chain: [],
  tree: [],

  classEditMode: false,
  isListening: false,

  selectedTrackKey: undefined,
  selectedTrack: undefined,
  selectedTrackFileItem: undefined,

  currentCategoryId: -1,

  audio: typeof window === 'undefined' ? undefined : new Audio(),

  categoriesFetch: true,
});

onMount(StoreClassifyPage, () => {
  if (typeof window === 'undefined') {
    return;
  }

  initStore().catch(console.error);
});

export const setSelectedTrackKey = (selectedKey: string) => {
  const track = StoreClassifyPage.get().chain.find(
    (_) => _.key === selectedKey && _.fsItem?.type === 'file',
  );

  StoreClassifyPage.setKey('selectedTrack', track);
  StoreClassifyPage.setKey('selectedTrackKey', selectedKey);

  reInitSelectedTrackFileItem(track?.fsItem?.filehash || '').catch(console.error);
};

export const reInitSelectedTrackFileItem = async (filehash: string) => {
  await api.categories
    .getTrackData(filehash || '')
    .then((_) => StoreClassifyPage.setKey('selectedTrackFileItem', _.data))
    .catch(console.error);
};

export const setCurrentCategoryId = (id: number) => {
  StoreClassifyPage.setKey('currentCategoryId', id);
};

export const setClassEditMode = (flag: boolean) => {
  StoreClassifyPage.setKey('classEditMode', flag);
};

export const setIsListening = (flag: boolean) => {
  StoreClassifyPage.setKey('isListening', flag);
};

export const handleCreateNewGroup = () => {
  api.categories
    .create({
      name: 'New unnamed category',
      values: ['First value', 'Second value'],
    })
    .finally(() => initCategories());
};

export const handleSaveCategoryEdit = (
  data: {
    name: string;
    values: { id?: number; value: string }[];
  },
  editCategoryForm: FormInstance,
) => {
  const { currentCategoryId } = StoreClassifyPage.get();

  api.categories
    .update({
      id: currentCategoryId,
      values: data.values,
      name: data.name,
    })
    .catch(console.error)
    .finally(() => {
      setCurrentCategoryId(-1);
      editCategoryForm.resetFields();
      return initCategories();
    });
};

export const initCategories = async () => {
  StoreClassifyPage.setKey('categoriesFetch', true);
  const categories = await api.categories.get().then((_) => _.data);
  StoreClassifyPage.setKey('categories', categories);
  StoreClassifyPage.setKey('categoriesFetch', false);
};

async function initStore() {
  const chainRaw = await api.scanner.getChain().then((_) => _.data);
  const chain = Object.values(chainRaw);

  const firstChildrenNessKey = findFirstChildnessKey(chain);
  const tree = getDirTreeRecursively(
    chain.filter((_) => _.fsItem?.type !== 'dir'),
    1,
    firstChildrenNessKey,
  );

  StoreClassifyPage.setKey('chain', chain);
  StoreClassifyPage.setKey('tree', tree);

  await initCategories();
}
