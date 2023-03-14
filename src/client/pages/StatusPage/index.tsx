import { Button, Card, Space, Switch, Table, Typography } from 'antd';
import { addSeconds, format, startOfDay } from 'date-fns';
import Head from 'next/head';
import { useMemo } from 'react';

import { api } from '@/client/api';
import { useServiceStatus } from '@/client/hooks/queries/useServiceStatus';
import { AdminLayout } from '@/client/layouts/AdminLayout';
import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { formatTime } from '@/client/utils/formatTime';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const day = startOfDay(new Date());

const StatusPage = ({ radioStatus, chain }: WithDefaultPageProps) => {
  const { data, refetch } = useServiceStatus(radioStatus);

  const systemStatus = (
    <Card title='System status'>
      <Space direction='vertical'>
        <Space direction='horizontal'>
          <Switch disabled={true} checked={data?.playing} />

          <Typography.Text>Playing</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={data?.syncing} />

          <Typography.Text>Syncing</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={data?.streaming} />

          <Typography.Text>Streaming</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={data?.scheduling} />

          <Typography.Text>Scheduling</Typography.Text>
        </Space>
      </Space>
    </Card>
  );

  const systemActions = (
    <Card title='System actions'>
      <Space direction='vertical' size='large'>
        <Space direction='vertical'>
          <Typography.Text>Common</Typography.Text>

          <Button>Restart service</Button>

          <Button
            disabled={data?.syncing}
            onClick={() => {
              api.scanner.startSync().finally(() => refetch());
              return refetch();
            }}
          >
            Start sync
          </Button>

          <Button
            disabled={data?.playing}
            onClick={() => api.player.playRandom().finally(() => refetch())}
          >
            Queue all randomly
          </Button>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Stream</Typography.Text>

          <Space wrap>
            <Button
              onClick={() => api.streamer.startStream().finally(() => refetch())}
              disabled={data?.streaming}
            >
              Start
            </Button>

            <Button
              onClick={() => api.streamer.stopStream().finally(() => refetch())}
              disabled={!data?.streaming}
            >
              Stop
            </Button>
          </Space>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Scheduling</Typography.Text>

          <Space wrap>
            <Button
              onClick={() => api.scheduler.start().finally(() => refetch())}
              disabled={data?.scheduling}
            >
              Start
            </Button>

            <Button
              onClick={() => api.scheduler.stop().finally(() => refetch())}
              disabled={!data?.scheduling}
            >
              Stop
            </Button>
          </Space>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Queue</Typography.Text>

          <Space wrap>
            <Button
              onClick={() => api.player.play().finally(() => refetch())}
              disabled={data?.queue?.state === 'playing'}
            >
              Start
            </Button>

            <Button
              onClick={() => api.player.stop().finally(() => refetch())}
              disabled={data?.queue?.state === 'stopped'}
            >
              Stop
            </Button>

            <Button
              onClick={() => api.player.clear().finally(() => refetch())}
              disabled={Number(data?.queue?.items?.length) < 1}
            >
              Clear
            </Button>
          </Space>
        </Space>
      </Space>
    </Card>
  );

  const dataSource = useMemo(
    () =>
      (data?.queue?.items || []).map((item) => {
        const fileItem = chain.find((c) => c.fsItem?.filehash === item.fileHash)?.fsItem;

        return {
          key: item.order,
          state: data?.currentFile === item.fileHash ? '-' : '',
          order: item.order,
          name: `${fileItem?.metadata?.artist} - ${fileItem?.metadata?.title}`,
          start: formatTime(item.startAt),
          end: formatTime(item.endAt),
        };
      }),
    [data?.queue?.items || []],
  );

  const columns = [
    {
      title: '',
      dataIndex: 'state',
      key: 'state',
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Start',
      dataIndex: 'start',
      key: 'start',
    },
    {
      title: 'End',
      dataIndex: 'end',
      key: 'end',
    },
  ];

  const queue =
    dataSource.length > 0 ? (
      <Table
        bordered={false}
        style={{ minWidth: '560px' }}
        size='small'
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    ) : (
      <Card title='Current queue' style={{ width: '580px' }}>
        <Typography.Text>Queue empty</Typography.Text>
      </Card>
    );

  return (
    <Space align='start' size='middle'>
      <Head>
        <title>nesorter :: status</title>
      </Head>

      <Space direction='vertical' size='middle'>
        {systemStatus}

        {systemActions}
      </Space>

      {queue}
    </Space>
  );
};

StatusPage.Layout = AdminLayout;
export default StatusPage;
export const getServerSideProps = withDefaultPageProps(() => Promise.resolve({ props: {} }));
