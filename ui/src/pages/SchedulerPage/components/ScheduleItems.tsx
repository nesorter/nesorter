import { Playlist, SchedulerItem } from '../../../api/types';
import { Box, Text } from '../../../components';
import { BASE_HEIGHT } from '../constants';
import { getSecondsInDay, getTimeFormatted } from '../utils';
import React, { useEffect, useState } from 'react';
import { addHours, addSeconds, differenceInSeconds, endOfDay, format, parse, secondsInDay, startOfDay } from 'date-fns';
import { StyledLine } from '../styles';
import styled from 'styled-components';
import { api } from '../../../api';
import { MultiSelect, Option } from "react-multi-select-component";

type Props = {
  items: SchedulerItem[];
  onUpdate: () => void;
}

const BASE_WIDTH = 72;

const StyledScheduleItemCell = styled(Box)`
  cursor: pointer;
  background: gray;
  
  &:hover {
    background: darkcyan;
    
    .extended {
      visibility: visible;
    }
  }
`;

const StyledExtendedBlock = styled(Box)`
  visibility: hidden;
  position: absolute;
  background-color: white;
  top: 100%;
  left: 0;
  
  width: 480px;
  padding: 24px;
  z-index: 1;
`;

const ScheduleItem = ({ id, playlistIds, startAt, endAt, index, onUpdate }: SchedulerItem & { index: number, onUpdate: () => void }) => {
  const [edit, setEdit] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<Option[]>([]);
  const [startTime, setStartTime] = useState(startAt);
  const [endTime, setEndTime] = useState(endAt);

  useEffect(() => {
    api.playlistsManager.getPlaylists()
      .then((res) => {
        setPlaylists(res);
        setSelected(playlistIds.split(',').map((_) => ({
          value: Number(_),
          label: res.find(k => k.id === Number(_))?.name || '',
        } as Option)));
      })
      .catch(alert);
  }, [playlistIds]);

  const currentSecond = (data: string) => {
    const date = parse(data, 'HH:mm', new Date());
    return secondsInDay - differenceInSeconds(endOfDay(date), date);
  };

  const handleSubmit = () => {
    return api.scheduler.updateItem(id, {
      startAt: startTime,
      endAt: endTime,
      playlistIds: selected.map(_ => _.value as string).join(','),
    }).then(onUpdate).catch(alert);
  };

  const secs = getSecondsInDay();
  const width = BASE_WIDTH;
  const left = (index % 8) * width;
  const top = 100 * startAt / secs;
  const height = (100 * endAt / secs) - top;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}%`,
    height: `${height}%`,
    width: `${width}px`,
  };

  const plIds = playlistIds.split(',');

  return (
    <StyledScheduleItemCell
      alignItems="center"
      justifyContent="center"
      style={style}
      flexDirection="column"
    >
      <Text color="white">#{id} <Text fontSize="10px">({getTimeFormatted(endAt - startAt)})</Text></Text>

      <StyledExtendedBlock className="extended" flexDirection="column" style={edit ? { visibility: 'visible' } : undefined}>
        {edit && (
          <div style={{ marginBottom: '48px' }}>
            <MultiSelect
              options={playlists.map(_ => ({ value: _.id, label: _.name }))}
              value={selected}
              onChange={setSelected}
              labelledBy="Select"
            />

            <div style={{ marginBottom: '4px' }} />

            <input
              type="time"
              value={format((addSeconds(startOfDay(new Date()), startTime)), 'HH:mm')}
              onInput={(ev) => {
                setStartTime(currentSecond(ev.currentTarget.value))
              }}
              placeholder="start time"
            />

            <div style={{ marginBottom: '4px' }} />

            <input
              type="time"
              value={format((addSeconds(startOfDay(new Date()), endTime)), 'HH:mm')}
              onInput={(ev) => {
                setEndTime(currentSecond(ev.currentTarget.value))
              }}
              placeholder="end time"
            />

            <div style={{ marginBottom: '4px' }} />

            <Text
              fontSize="10px"
              onClick={() => {
                api.scheduler.deleteItem(id).catch(alert);
              }}
            >
              кликните тут для удаления
            </Text>
          </div>
        )}

        <Text fontSize="10px" onClick={() => {
          if (edit) {
            handleSubmit().catch(alert);
          }

          setEdit(_ => !_);
        }}>
          {edit ? '(кликните тут же для скрытия и сохранения)' : '(кликните тут для редактирования)'}
        </Text>

        <div style={{ marginBottom: '16px' }} />
        <Text>{getTimeFormatted(startAt)} - {getTimeFormatted(endAt)}</Text>
        <div style={{ marginBottom: '16px' }} />

        {plIds.map(plId => (
          <Text>
            #{plId} - {playlists.find(_ => _.id === Number(plId))?.name}
          </Text>
        ))}
      </StyledExtendedBlock>
    </StyledScheduleItemCell>
  );
}

export const ScheduleItems = ({ items, onUpdate }: Props) => {
  const times: string[] = [];
  for (let i = 0; i < 24 * 2; i++) {
    if (i === 24) {
      times.push('24:00');
    } else {
      times.push(format(addHours(startOfDay(new Date()), i), 'HH:mm'));
    }
  }

  return (
    <Box flexDirection="column" height={BASE_HEIGHT * 24} width={12 * BASE_WIDTH} style={{ position: 'relative' }}>
      {times.map(_ => (
        <div key={_} style={{ height: BASE_HEIGHT / 2, position: 'relative' }}>
          <StyledLine />
        </div>
      ))}

      {items.map((_, index) => (
        <ScheduleItem
          key={_.id}
          index={index}
          id={_.id}
          startAt={_.startAt}
          endAt={_.endAt}
          playlistIds={_.playlistIds}
          onUpdate={onUpdate}
        />
      ))}
    </Box>
  );
}
