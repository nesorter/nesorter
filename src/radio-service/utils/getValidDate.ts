import { config } from '@/radio-service/utils';

export const getValidDate = () =>
  new Date(new Date().setHours(new Date().getHours() + config.TZ_HOURS_SHIFT));
