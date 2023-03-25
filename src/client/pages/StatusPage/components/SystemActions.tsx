import { useStore } from '@nanostores/react';
import { Button, Card, Space, Typography } from 'antd';

import { api } from '@/client/api';
import { initStatus, StoreStatusPage } from '@/client/pages/StatusPage/store';

export const SystemActions = () => {
  const { radioStatus } = useStore(StoreStatusPage);

  return (
    <Card title='System actions'>
      <Space direction='vertical' size='large'>
        <Space direction='vertical'>
          <Typography.Text>Common</Typography.Text>

          <Button>Restart service</Button>

          <Button
            disabled={radioStatus?.syncing}
            onClick={() => {
              api.scanner.startSync().finally(() => initStatus());
              return initStatus();
            }}
          >
            Start sync
          </Button>

          <Button
            disabled={radioStatus?.playing}
            onClick={() => api.player.playRandom().finally(() => initStatus())}
          >
            Queue all randomly
          </Button>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Stream</Typography.Text>

          <Space wrap>
            <Button
              onClick={() => api.streamer.startStream().finally(() => initStatus())}
              disabled={radioStatus?.streaming}
            >
              Start
            </Button>

            <Button
              onClick={() => api.streamer.stopStream().finally(() => initStatus())}
              disabled={!radioStatus?.streaming}
            >
              Stop
            </Button>
          </Space>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Scheduling</Typography.Text>

          <Space wrap>
            <Button
              onClick={() => api.scheduler.start().finally(() => initStatus())}
              disabled={radioStatus?.scheduling}
            >
              Start
            </Button>

            <Button
              onClick={() => api.scheduler.stop().finally(() => initStatus())}
              disabled={!radioStatus?.scheduling}
            >
              Stop
            </Button>
          </Space>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Queue</Typography.Text>

          <Space wrap>
            <Button
              onClick={() => api.player.play().finally(() => initStatus())}
              disabled={radioStatus?.queue?.state === 'playing'}
            >
              Start
            </Button>

            <Button
              onClick={() => api.player.stop().finally(() => initStatus())}
              disabled={radioStatus?.queue?.state === 'stopped'}
            >
              Stop
            </Button>

            <Button
              onClick={() => api.player.clear().finally(() => initStatus())}
              disabled={Number(radioStatus?.queue?.items?.length) < 1}
            >
              Clear
            </Button>
          </Space>
        </Space>
      </Space>
    </Card>
  );
};
