import { useMemo } from 'react';

import { findFirstChildnessKey } from '@/client/utils/recursiveTrees';
import type { ChainItem } from '@/radio-service/types/Scanner';

export const useFirstChildnessChainItemKey = (chain: ChainItem[]) => {
  return useMemo(() => {
    return findFirstChildnessKey(chain);
  }, [chain]);
};
