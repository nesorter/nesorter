import { useQuery } from 'react-query';

import { api } from '@/client/api';
import type { ServiceStatus } from '@/radio-service/types/ServiceStatus';

export const useStatus = (initialData?: ServiceStatus) => {
  return useQuery<ServiceStatus>(['status'], () => api.logger.getStatus().then((_) => _.data), {
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
    enabled: true,
    initialData,
  });
};
