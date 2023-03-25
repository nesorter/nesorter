import { useStore } from '@nanostores/react';
import { Card, Space, Switch, Typography } from 'antd';

import { StoreStatusPage } from '@/client/pages/StatusPage/store';

export const SystemStatus = () => {
  const { radioStatus } = useStore(StoreStatusPage);

  return (
    <Card title='System status'>
      <Space direction='vertical'>
        <Space direction='horizontal'>
          <Switch disabled={true} checked={radioStatus?.playing} />

          <Typography.Text>Playing</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={radioStatus?.syncing} />

          <Typography.Text>Syncing</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={radioStatus?.streaming} />

          <Typography.Text>Streaming</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={radioStatus?.scheduling} />

          <Typography.Text>Scheduling</Typography.Text>
        </Space>
      </Space>
    </Card>
  );
};
