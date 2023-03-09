import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, List, Select, Slider, Space, Typography } from 'antd';
import { secondsInDay } from 'date-fns';
import { useState } from 'react';

import { api } from '@/client/api';
import { useScheduleItems } from '@/client/hooks/queries/useScheduleItems';
import { AdminLayout } from '@/client/layouts/AdminLayout';
import type { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { formatTime } from '@/client/utils/formatTime';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';
import type { AggregatedPlaylistItem } from '@/radio-service/types/Playlist';
import type { AggregatedScheduleItem } from '@/radio-service/types/Scheduler';

const marks = {
  [3600 * 0]: '0',
  [3600 * 1]: '1',
  [3600 * 2]: '2',
  [3600 * 3]: '3',
  [3600 * 4]: '4',
  [3600 * 5]: '5',
  [3600 * 6]: '6',
  [3600 * 7]: '7',
  [3600 * 8]: '8',
  [3600 * 9]: '9',
  [3600 * 10]: '10',
  [3600 * 11]: '11',
  [3600 * 12]: '12',
  [3600 * 13]: '13',
  [3600 * 14]: '14',
  [3600 * 15]: '15',
  [3600 * 16]: '16',
  [3600 * 17]: '17',
  [3600 * 18]: '18',
  [3600 * 19]: '19',
  [3600 * 20]: '20',
  [3600 * 21]: '21',
  [3600 * 22]: '22',
  [3600 * 23]: '23',
  [3600 * 24 - 1]: '24',
};

const SchedulerPage = ({
  scheduleItems,
  playlists,
}: WithDefaultPageProps<{
  scheduleItems: AggregatedScheduleItem[];
  playlists: AggregatedPlaylistItem[];
}>) => {
  const [form] = Form.useForm();
  const query = useScheduleItems(scheduleItems);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(-1);
  const [sortMode, setSortMode] = useState('time');
  const [viewMoreIds, setViewMoreIds] = useState<number[]>([]);
  const [nextTimeData, setNextTimeData] = useState<[number, number]>([0, 0]);

  const handleCreate = () => {
    api.scheduler.createItem('New playlist', 1, 3600, '1').finally(() => query.refetch());
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setIsEditing(true);

    const item = query.data?.find((_) => _.id === id);
    if (!item) {
      return;
    }

    setNextTimeData([item.startAt, item.endAt]);
    form.setFieldValue('name', item.name);
    form.setFieldValue('merging', Boolean(item.withMerging));
    form.setFieldValue(
      'playlists',
      item.playlists.map((_) => _.playlistId),
    );
  };

  const handleSave = (data: { name: string; merging: boolean; playlists: number[] }) => {
    api.scheduler
      .updateItem(editingId, {
        startAt: nextTimeData[0],
        endAt: nextTimeData[1],
        withMerging: data.merging ? 1 : 0,
        playlistIds: data.playlists.join(','),
        name: data.name,
      })
      .finally(() => {
        setEditingId(-1);
        setIsEditing(false);
        form.resetFields();
        return query.refetch();
      });
  };

  const handleMore = (id: number) => {
    if (viewMoreIds.includes(id)) {
      setViewMoreIds(viewMoreIds.filter((_) => _ !== id));
    } else {
      setViewMoreIds([...viewMoreIds, id]);
    }
  };

  return (
    <Card
      title='Schedule items'
      style={{ width: '100%' }}
      extra={
        <Space size='large'>
          <Button onClick={() => setSortMode(sortMode === 'time' ? 'id' : 'time')}>
            Change sort
          </Button>

          <Button type='primary' onClick={handleCreate}>
            Create
          </Button>
        </Space>
      }
    >
      <List
        dataSource={query.data?.sort((a, b) =>
          sortMode === 'id' ? a.id - b.id : a.startAt - b.startAt,
        )}
        bordered
        itemLayout='vertical'
        rowKey='id'
        renderItem={(item) => (
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
                  <EditOutlined key='edit-changes' onClick={() => handleEdit(item.id)} />
                )}

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
                min={0}
                max={secondsInDay - 1}
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

              {editingId === item.id && isEditing && (
                <Form
                  form={form}
                  name='login-form'
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  style={{ maxWidth: 600 }}
                  onFinish={handleSave}
                  onFinishFailed={console.error}
                  autoComplete='off'
                >
                  <Form.Item
                    label='Name'
                    name='name'
                    rules={[{ required: true, message: 'This field required' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label='Playlists'
                    name='playlists'
                    rules={[{ required: true, message: 'This field required' }]}
                  >
                    <Select
                      mode='multiple'
                      options={playlists.map((pl) => ({
                        value: pl.id,
                        label: pl.name,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    label='Merging'
                    name='merging'
                    tooltip='Allows the scheduler to virtually merge all selected playlists into one'
                  >
                    <Checkbox />
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
                    <Button type='primary' htmlType='submit'>
                      Save
                    </Button>
                  </Form.Item>
                </Form>
              )}

              {viewMoreIds.includes(item.id) && (
                <>
                  <Typography.Text>Playlists:</Typography.Text>

                  <List
                    size='small'
                    dataSource={item.playlists}
                    renderItem={(item) => (
                      <List.Item>
                        #{item.playlist?.id} {item.playlist?.name}
                      </List.Item>
                    )}
                    bordered
                    header={
                      <Typography.Text>
                        <Typography.Text>{'Merging mode '}</Typography.Text>

                        {item.withMerging > 0 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      </Typography.Text>
                    }
                  />
                </>
              )}
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};

SchedulerPage.Layout = AdminLayout;
export default SchedulerPage;
export const getServerSideProps = withDefaultPageProps(async () => {
  const scheduleItems = await api.scheduler.getItems().then((_) => _.data);
  const playlists = await api.playlistsManager.getPlaylists().then((items) => items.data);

  return { props: { scheduleItems, playlists } };
});
