import { useQuery } from 'react-query';

import { api } from '@/client/api';
import type { ServiceStatus } from '@/radio-service/types/ServiceStatus';

export const useServiceStatus = (initialData?: ServiceStatus) => {
  return useQuery<ServiceStatus>(
    ['service status'],
    () => api.logger.getStatus().then((_) => _.data),
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      enabled: true,
      initialData: initialData,
    },
  );
};
