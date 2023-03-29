import { map, onMount } from 'nanostores';

import { api } from '@/client/api';
import type { ChainItem, ServiceStatus } from '@/radio-service/types';

export type TStoreStatusPage = {
  radioStatus?: ServiceStatus;
  chain: ChainItem[];
};

export const StoreStatusPage = map<TStoreStatusPage>({
  radioStatus: undefined,
  chain: [],
});

onMount(StoreStatusPage, () => {
  if (typeof window === 'undefined') {
    return;
  }

  initStore().catch(console.error);
});

export const initStatus = async () => {
  const status = await api.logger.getStatus().then((_) => _.data);
  StoreStatusPage.setKey('radioStatus', status);
};

const loopStatus = async () => {
  await initStatus();
  setTimeout(() => loopStatus(), 2000);
};

const initStore = async () => {
  await loopStatus();

  const chainRaw = await api.scanner.getChain().then((_) => _.data);
  const chain = Object.values(chainRaw);
  StoreStatusPage.setKey('chain', chain);
};
