import { useStore } from '@nanostores/react';
import { Button, Space } from 'antd';

import { handleCreate, setSortMode, StoreSchedulerPage } from '@/client/pages/SchedulerPage/store';

export const Extra = () => {
  const { sortMode } = useStore(StoreSchedulerPage);

  return (
    <Space size='large'>
      <Button onClick={() => setSortMode(sortMode === 'time' ? 'id' : 'time')}>Change sort</Button>

      <Button type='primary' onClick={handleCreate}>
        Create
      </Button>
    </Space>
  );
};
