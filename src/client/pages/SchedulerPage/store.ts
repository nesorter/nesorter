import { FormInstance } from 'antd';
import { map, onMount } from 'nanostores';

import { api } from '@/client/api';
import type { AggregatedPlaylistItem, AggregatedScheduleItem } from '@/radio-service/types';

export type TStoreSchedulerPage = {
  scheduleItems: AggregatedScheduleItem[];
  playlists: AggregatedPlaylistItem[];

  scheduleItemsFetching: boolean;
  isEditing: boolean;
  editingId: number;
  sortMode: string;
  viewMoreIds: number[];
  nextTimeData: [number, number];

  marks: Record<number, string>;
};

export const StoreSchedulerPage = map<TStoreSchedulerPage>({
  scheduleItems: [],
  playlists: [],

  scheduleItemsFetching: true,
  isEditing: false,
  editingId: -1,
  sortMode: 'time',
  viewMoreIds: [],
  nextTimeData: [0, 0],

  marks: {
    [0]: '0',
    [3600]: '1',
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
    [3600 * 24 - 60]: '24',
  },
});

const initSchedules = async () => {
  StoreSchedulerPage.setKey('scheduleItemsFetching', true);
  const scheduleItems = await api.scheduler.getItems().then((_) => _.data);
  StoreSchedulerPage.setKey('scheduleItems', scheduleItems);
  StoreSchedulerPage.setKey('scheduleItemsFetching', false);
};

const initPlaylists = async () => {
  const playlists = await api.playlistsManager.getPlaylists().then((_) => _.data);
  StoreSchedulerPage.setKey('playlists', playlists);
};

export const setEditingId = (id: number) => {
  StoreSchedulerPage.setKey('editingId', id);
};

export const setIsEditing = (flag: boolean) => {
  StoreSchedulerPage.setKey('isEditing', flag);
};

export const setSortMode = (flag: string) => {
  StoreSchedulerPage.setKey('sortMode', flag);
};

export const setNextTimeData = (nextTimeData: [number, number]) => {
  StoreSchedulerPage.setKey('nextTimeData', nextTimeData);
};

export const setViewMoreIds = (ids: number[]) => {
  StoreSchedulerPage.setKey('viewMoreIds', ids);
};

export const handleCreate = () => {
  api.scheduler.createItem('New playlist', 1, 3600, '1').finally(() => initSchedules());
};

export const handleDelete = (id: number) => {
  if (confirm('You really want DELETE record?')) {
    api.scheduler.deleteItem(id).finally(() => initSchedules());
  }
};

export const handleMore = (id: number) => {
  const { viewMoreIds } = StoreSchedulerPage.get();

  if (viewMoreIds.includes(id)) {
    setViewMoreIds(viewMoreIds.filter((_) => _ !== id));
  } else {
    setViewMoreIds([...viewMoreIds, id]);
  }
};

export const handleEdit = (id: number, form: FormInstance) => {
  setEditingId(id);
  setIsEditing(true);

  const { scheduleItems } = StoreSchedulerPage.get();
  const item = scheduleItems.find((_) => _.id === id);
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

export const handleSave = (
  data: { name: string; merging: boolean; playlists: number[] },
  form: FormInstance,
) => {
  const { editingId, nextTimeData } = StoreSchedulerPage.get();

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
      return initSchedules();
    });
};

onMount(StoreSchedulerPage, () => {
  if (typeof window === 'undefined') {
    return;
  }

  initSchedules().catch(console.error);
  initPlaylists().catch(console.error);
});
