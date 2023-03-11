import { useQuery } from 'react-query';

import { api } from '@/client/api';
import type { ChainItem } from '@/radio-service/types/Scanner';

export const useChain = () => {
  return useQuery<ChainItem[]>(
    ['chain'],
    () => api.scanner.getChain().then((_) => Object.values(_.data)),
    {
      refetchOnWindowFocus: false,
      enabled: true,
    },
  );
};
