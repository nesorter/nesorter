import { DeleteOutlined, EditOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { useStore } from '@nanostores/react';
import { Form, FormInstance, List, Slider, Space, Typography } from 'antd';
import { secondsInDay } from 'date-fns';

import { ScheduleItemForm } from '@/client/pages/SchedulerPage/components/ScheduleItemForm';
import { ScheduleItemPlaylists } from '@/client/pages/SchedulerPage/components/ScheduleItemPlaylists';
import {
  handleDelete,
  handleEdit,
  handleMore,
  setNextTimeData,
  StoreSchedulerPage,
} from '@/client/pages/SchedulerPage/store';
import { formatTime } from '@/client/utils/formatTime';
import type { AggregatedScheduleItem } from '@/radio-service/types';

export const ScheduleItem = ({
  form,
  item,
}: {
  form: FormInstance;
  item: AggregatedScheduleItem;
}) => {
  const { marks, editingId, isEditing, viewMoreIds, nextTimeData } = useStore(StoreSchedulerPage);

  return (
    <List.Item>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Space size='large'>
          {viewMoreIds.includes(item.id) ? (
            <ZoomOutOutlined key='more-link-out' onClick={() => handleMore(item.id)} />
          ) : (
            <ZoomInOutlined key='more-link-in' onClick={() => handleMore(item.id)} />
          )}

          {editingId === item.id || isEditing ? (
            <EditOutlined key='save-changes' />
          ) : (
            <EditOutlined key='edit-changes' onClick={() => handleEdit(item.id, form)} />
          )}

          <DeleteOutlined onClick={() => handleDelete(item.id)} />

          <Typography.Text>
            <Typography.Text>#{item.id}, </Typography.Text>

            <Typography.Text>
              {`${formatTime(item.startAt)} - ${formatTime(item.endAt)}`},
            </Typography.Text>

            <Typography.Text strong>{` ${item.name}`}</Typography.Text>
          </Typography.Text>
        </Space>

        <Slider
          range={{ draggableTrack: true }}
          min={60}
          max={secondsInDay - 60}
          marks={marks}
          step={60 * 5}
          defaultValue={
            isEditing && editingId === item.id ? nextTimeData : [item.startAt, item.endAt]
          }
          onChange={setNextTimeData}
          disabled={editingId !== item.id}
          tooltip={{
            formatter: formatTime,
          }}
        />

        {editingId === item.id && isEditing && <ScheduleItemForm item={item} form={form} />}

        {viewMoreIds.includes(item.id) && <ScheduleItemPlaylists {...item} />}
      </Space>
    </List.Item>
  );
};
