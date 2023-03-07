import { ChainItem } from '@/radio-service/types/Scanner';
import { ServiceStatus } from '@/radio-service/types/ServiceStatus';

export type WithDefaultPageProps<T = Record<string, unknown>> = {
  clientAdminToken: string | null;
  adminSide: boolean;
  version: string;
  radioStatus: ServiceStatus;
  chain: ChainItem[];
} & T;
