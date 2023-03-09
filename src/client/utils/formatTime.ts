import { addSeconds, format, startOfDay } from 'date-fns';

const day = startOfDay(new Date());

export const formatTime = (seconds?: number) => format(addSeconds(day, seconds || 0), 'HH:mm');
