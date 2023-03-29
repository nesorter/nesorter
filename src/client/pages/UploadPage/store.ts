import { map, onMount } from 'nanostores';

import { api } from '@/client/api';
import { DirTree, getDirTreeRecursively } from '@/client/utils/recursiveTrees';
import type { ChainItem } from '@/radio-service/types';

export type TStoreUploadPage = {
  chain: ChainItem[];
  directoriesTree: DirTree[];
};

export const StoreUploadPage = map<TStoreUploadPage>({
  chain: [],
  directoriesTree: [],
});

const initStore = async () => {
  const chainRaw = await api.scanner.getChain().then((_) => _.data);
  const chain = Object.values(chainRaw);
  StoreUploadPage.setKey('chain', chain);

  const directoriesTree = getDirTreeRecursively(
    chain.filter((_) => _.type === 'dir'),
    0,
  );
  StoreUploadPage.setKey('directoriesTree', directoriesTree);
};

onMount(StoreUploadPage, () => {
  if (typeof window === 'undefined') {
    return;
  }

  initStore().catch(console.error);
});
