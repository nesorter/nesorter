import { useStore } from '@nanostores/react';
import { Card, Table, Typography } from 'antd';
import { useMemo } from 'react';

import { StoreStatusPage } from '@/client/pages/StatusPage/store';
import { formatTime } from '@/client/utils/formatTime';

export const SystemQueues = () => {
  const { radioStatus, chain } = useStore(StoreStatusPage);

  const dataSource = useMemo(
    () =>
      (radioStatus?.queue?.items || []).map((item) => {
        const fileItem = chain.find((c) => c.fsItem?.filehash === item.fileHash)?.fsItem;

        return {
          key: item.order,
          state: radioStatus?.currentFile === item.fileHash ? '-' : '',
          order: item.order,
          name: `${fileItem?.metadata?.artist} - ${fileItem?.metadata?.title}`,
          start: formatTime(item.startAt),
          end: formatTime(item.endAt),
        };
      }),
    [radioStatus?.queue?.items, chain, radioStatus?.currentFile],
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

  if (dataSource.length > 0) {
    return (
      <Table
        bordered={false}
        style={{ minWidth: '560px' }}
        size='small'
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    );
  } else {
    return (
      <Card title='Current queue' style={{ width: '580px' }}>
        <Typography.Text>Queue empty</Typography.Text>
      </Card>
    );
  }
};
