import { useQuery } from 'react-query';

import { api } from '@/client/api';
import type { AggregatedClassCategory } from '@/radio-service/types/Classificator';

export const useCatalogs = (initialData?: AggregatedClassCategory[]) => {
  return useQuery<AggregatedClassCategory[]>(
    ['categories'],
    () => api.categories.get().then((_) => _.data),
    {
      refetchOnWindowFocus: true,
      enabled: true,
      initialData,
    },
  );
};
