import { useQuery } from 'react-query';

import { api } from '@/client/api';
import type { AggregatedFileItem } from '@/radio-service/types/Scanner';

export const useSelectedFileItem = (filehash?: string) => {
  return useQuery<AggregatedFileItem>(
    ['fileitem', 'classificator', filehash],
    () => api.categories.getTrackData(filehash || '').then((_) => _.data),
    {
      refetchOnWindowFocus: true,
      enabled: filehash !== undefined,
    },
  );
};
