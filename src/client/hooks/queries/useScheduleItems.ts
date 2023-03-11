import { useQuery } from 'react-query';

import { api } from '@/client/api';
import { AggregatedScheduleItem } from '@/radio-service/types/Scheduler';

export const useScheduleItems = (initialData?: AggregatedScheduleItem[]) => {
  return useQuery<AggregatedScheduleItem[]>(
    ['schedule items'],
    () => api.scheduler.getItems().then((_) => _.data),
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      enabled: true,
      initialData: initialData,
    },
  );
};
