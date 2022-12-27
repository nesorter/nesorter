import { addSeconds, differenceInSeconds, endOfDay, format, parse, secondsInDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../api";
import { SchedulerItem } from "../../api/types";
import { Box, Button, Pane, Text } from "../../components";

type Form = {
  start: string;
  end: string;
  playlistIds: string;
};

export const SchedulerPage = () => {
  const createForm = useForm<Form>();
  const [items, setItems] = useState<SchedulerItem[]>([]);

  const currentSecond = (data: string) => {
    const date = parse(data, 'HH:mm', new Date());
    return secondsInDay - differenceInSeconds(endOfDay(date), date);
  };

  const init = () => {
    return api.scheduler.getItems().then(setItems).catch(alert);
  };

  const handleSubmit = (data: Form) => {
    return api.scheduler.createItem(currentSecond(data.start), currentSecond(data.end), data.playlistIds).then(init).catch(alert);
  };

  const getTime = (time: number) => {
    return format(addSeconds(startOfDay(new Date()), time), 'HH:mm');
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Box gap={14}>
      <Box width="100%" maxWidth="256px" minWidth="256px">
        <Pane padding="14px">
          {items.map(_ => (
            <Box key={_.id} gap={14} alignItems="center">
              <Text color="textLight">#{_.id} {getTime(_.startAt)} - {getTime(_.endAt)}</Text>
              <Text color="textLight" fontWeight="bold">PL#{_.playlistId}</Text>

              <Button
                size="small"
                variant="secondary"
                onClick={() => api.scheduler.deleteItem(_.id).then(init)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Pane>
      </Box>

      <form onSubmit={createForm.handleSubmit(handleSubmit, console.log)}>
        <Box flexDirection="column">
          <input type="time" {...createForm.register('start')} placeholder="start time" />
          <input type="time" {...createForm.register('end')} placeholder="end time" />
          <input {...createForm.register('playlistIds')} placeholder="playlists id (use ',' as separator)" />
          <input type="submit" value="create" />
        </Box>
      </form>
    </Box>
  );
}

export default SchedulerPage;
