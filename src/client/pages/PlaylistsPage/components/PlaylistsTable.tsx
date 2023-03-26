import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useStore } from '@nanostores/react';
import { Button, Card, FormInstance, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { api } from '@/client/api';
import {
  handleCreatePlaylist,
  handleEditPlaylist,
  initPlaylists,
  StorePlaylistsPage,
} from '@/client/pages/PlaylistsPage/store';

const columns: ColumnsType<{
  id: string;
  name: string;
  type: string;
  locatedAt: string;
  actions: JSX.Element;
}> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'right',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    align: 'left',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'left',
  },
  {
    title: 'Located At',
    dataIndex: 'locatedAt',
    key: 'locatedAt',
    align: 'left',
  },
  {
    title: '',
    dataIndex: 'actions',
    key: 'actions',
    align: 'right',
  },
];

export const PlaylistsTable = ({ editForm }: { editForm: FormInstance }) => {
  const { playlists, chain } = useStore(StorePlaylistsPage);

  const dataSource = playlists.map((item) => {
    let locatedAt = '';
    if (item.fsMeta) {
      const fileItem = chain.find(
        (_) => _?.fsItem?.filehash === (item.fsMeta || [])[0]?.fileItemHash,
      );
      locatedAt = fileItem?.fsItem?.path || '';
    }

    return {
      id: `#${item.id}`,
      name: item.name,
      type: item.type === 'fs' ? 'Directory' : 'Manual',
      locatedAt,
      actions: (
        <Space>
          <Button onClick={() => handleEditPlaylist(item.id, editForm)} icon={<EditOutlined />} />

          <Button
            icon={<DeleteOutlined />}
            onClick={() =>
              api.playlistsManager.deletePlaylist(item.id).finally(() => initPlaylists())
            }
          />
        </Space>
      ),
    };
  });

  return (
    <Card
      title='Playlists'
      style={{ width: '100%' }}
      extra={
        <Button type='primary' onClick={() => handleCreatePlaylist()}>
          Create
        </Button>
      }
    >
      <Table
        style={{ minWidth: '560px' }}
        size='small'
        rowKey={(_) => _.id}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </Card>
  );
};
