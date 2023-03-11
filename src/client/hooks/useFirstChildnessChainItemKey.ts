import { useMemo } from 'react';

import { getDirTreeRecursively } from '@/client/utils/recursiveTrees';
import { ChainItem } from '@/radio-service/types/Scanner';

export const useFirstChildnessChainItemKey = (chain: ChainItem[]) => {
  return useMemo(() => {
    let step = 0;
    let key = '';
    let extracted = getDirTreeRecursively(
      chain.filter((_) => _.fsItem?.type !== 'dir'),
      0,
    );

    while (key === '' && step < chain.length) {
      for (const item of extracted) {
        if (item.children.length > 1) {
          key = item.key;
        } else {
          extracted = item.children;
        }
      }

      step += 1;
    }

    return key;
  }, [chain]);
};
