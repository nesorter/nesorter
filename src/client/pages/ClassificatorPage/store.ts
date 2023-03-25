import { map, onMount } from 'nanostores';

import { api } from '@/client/api';
import {
  DirTree,
  findFirstChildnessKey,
  getDirTreeRecursively,
} from '@/client/utils/recursiveTrees';
import type { AggregatedClassCategory, ChainItem } from '@/radio-service/types';

export type TStoreClassifyPage = {
  categories: AggregatedClassCategory[];
  chain: ChainItem[];
  tree: DirTree[];

  classEditMode: boolean;
  isListening: boolean;

  selectedTrackKey?: string;
  selectedTrack?: ChainItem;

  currentCategoryId: number;

  audio?: HTMLAudioElement;
};

export const StoreClassifyPage = map<TStoreClassifyPage>({
  categories: [],
  chain: [],
  tree: [],

  classEditMode: false,
  isListening: false,

  selectedTrackKey: undefined,
  selectedTrack: undefined,

  currentCategoryId: -1,

  audio: typeof window === 'undefined' ? undefined : new Audio(),
});

onMount(StoreClassifyPage, () => {
  initStore().catch(console.error);
});

export const setSelectedTrackKey = (selectedKey: string) => {
  const track = StoreClassifyPage.get().chain.find(
    (_) => _.key === selectedKey && _.fsItem?.type === 'file',
  );

  StoreClassifyPage.setKey('selectedTrack', track);
  StoreClassifyPage.setKey('selectedTrackKey', selectedKey);
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

export const initCategories = async () => {
  const categories = await api.categories.get().then((_) => _.data);
  StoreClassifyPage.setKey('categories', categories);
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
