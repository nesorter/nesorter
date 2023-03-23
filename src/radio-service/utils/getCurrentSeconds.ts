import { differenceInSeconds, endOfDay, secondsInDay } from 'date-fns';

import { getValidDate } from '@/radio-service/utils';

export function getCurrentSeconds() {
  return secondsInDay - differenceInSeconds(endOfDay(getValidDate()), getValidDate());
}
