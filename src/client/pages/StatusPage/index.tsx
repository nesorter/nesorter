import { Button, Card, Space, Switch, Table, Typography } from 'antd';

import { AdminLayout } from '@/client/layouts/AdminLayout';
import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const StatusPage = (props: WithDefaultPageProps) => {
  console.log(props);

  const systemStatus = (
    <Card title='System status'>
      <Space direction='vertical'>
        <Space direction='horizontal'>
          <Switch disabled={true} checked={true} />

          <Typography.Text>Playing</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={true} />

          <Typography.Text>Syncing</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={true} />

          <Typography.Text>Streaming</Typography.Text>
        </Space>

        <Space direction='horizontal'>
          <Switch disabled={true} checked={true} />

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

          <Button>Start sync</Button>

          <Button>Play all randomly</Button>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Stream</Typography.Text>

          <Space wrap>
            <Button>Start</Button>

            <Button>Stop</Button>
          </Space>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Scheduling</Typography.Text>

          <Space wrap>
            <Button>Start</Button>

            <Button>Stop</Button>
          </Space>
        </Space>

        <Space direction='vertical'>
          <Typography.Text>Queue</Typography.Text>

          <Space wrap>
            <Button>Start</Button>

            <Button>Stop</Button>

            <Button>Clear</Button>
          </Space>
        </Space>
      </Space>
    </Card>
  );

  const dataSource = [
    {
      key: '1',
      state: '>',
      order: 332,
      name: 'Digitalism - Blitz (Original Version)',
      start: '14:39:53',
      end: '14:44:11',
    },
    {
      key: '2',
      state: '',
      order: 333,
      name: 'Piri - soft spot',
      start: '14:44:06',
      end: '14:51:45',
    },
  ];

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

  const queue = <Table size='small' dataSource={dataSource} columns={columns} pagination={false} />;

  return (
    <Space align='start' size='middle'>
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
