import { addSeconds, format, secondsInDay, startOfDay } from 'date-fns';

export const getTimeFormatted = (time: number) => {
  return format(addSeconds(startOfDay(new Date()), time), 'HH:mm');
};

export const getSecondsInDay = () => secondsInDay;
