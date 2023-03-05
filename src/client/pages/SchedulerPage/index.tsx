import { differenceInSeconds, endOfDay, parse, secondsInDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { api } from '../../api';
import { ScheduleItem } from '../../api/types';
import { Box } from '../../components';
import { ScheduleItems } from './components/ScheduleItems';
import { Timeline } from './components/Timeline';

type Form = {
  start: string;
  end: string;
  playlistIds: string;
};

export const SchedulerPage = () => {
  const createForm = useForm<Form>();
  const [items, setItems] = useState<ScheduleItem[]>([]);

  const currentSecond = (data: string) => {
    const date = parse(data, 'HH:mm', new Date());
    return secondsInDay - differenceInSeconds(endOfDay(date), date);
  };

  const init = () => {
    return api.scheduler.getItems().then(setItems).catch(alert);
  };

  const handleSubmit = (data: Form) => {
    return api.scheduler
      .createItem(currentSecond(data.start), currentSecond(data.end), data.playlistIds)
      .then(init)
      .catch(alert);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Box gap={20}>
      <Box gap={14}>
        <form onSubmit={createForm.handleSubmit(handleSubmit, console.log)}>
          <Box flexDirection='column'>
            <input type='time' {...createForm.register('start')} placeholder='start time' />

            <input type='time' {...createForm.register('end')} placeholder='end time' />

            <input
              {...createForm.register('playlistIds')}
              placeholder="playlists id (use ',' as separator)"
            />

            <input type='submit' value='create' />
          </Box>
        </form>
      </Box>

      <Box gap='8px'>
        <Timeline />

        <ScheduleItems onUpdate={init} items={items.sort((a, b) => a.startAt - b.startAt)} />
      </Box>
    </Box>
  );
};

export default SchedulerPage;
