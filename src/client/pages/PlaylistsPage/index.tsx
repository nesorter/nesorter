import { DeleteOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  List,
  message,
  Modal,
  notification,
  Select,
  Space,
  Table,
  TreeSelect,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useMemo, useState } from 'react';

import { api } from '@/client/api';
import { usePlaylistItems, usePlaylists } from '@/client/hooks/queries/usePlaylists';
import { useFirstChildnessChainItemKey } from '@/client/hooks/useFirstChildnessChainItemKey';
import { AdminLayout } from '@/client/layouts/AdminLayout';
import { TreeTransfer } from '@/client/pages/PlaylistsPage/components/TreeTransfer';
import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import {
  getDirChainItemByKey,
  getDirKeyByFilehash,
  getDirTreeRecursively,
} from '@/client/utils/recursiveTrees';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';
import type { AggregatedPlaylistItem, DtoUpdatePlaylist } from '@/radio-service/types/Playlist';

const PlaylistsPage = ({
  playlists,
  chain,
}: WithDefaultPageProps<{ playlists: AggregatedPlaylistItem[] }>) => {
  const [messageApi] = message.useMessage();
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isCreatingInProgress, setIsCreatingInProgress] = useState(false);
  const [currentEditingPlaylist, setCurrentEditingPlaylist] = useState(-1);
  const [isEditingInProgress, setIsEditingInProgress] = useState(false);
  const [transferSelected, setTransferSelected] = useState<string[]>([]);

  const query = usePlaylists(playlists);
  const queryItems = usePlaylistItems(currentEditingPlaylist);

  const currentPlaylist = query.data?.find((_) => _.id === currentEditingPlaylist);

  useEffect(() => {
    setTransferSelected(
      queryItems.data?.map((item) => {
        const fromChain = chain.find((_) => _.fsItem?.filehash === item.fileItemHash);
        return fromChain?.key || '';
      }) || [],
    );
  }, [chain, queryItems.data]);

  const firstChildnessChainItemKey = useFirstChildnessChainItemKey(chain);

  const transferTree = useMemo(
    () =>
      getDirTreeRecursively(
        chain.filter((_) => _.fsItem?.type !== 'dir'),
        1,
        firstChildnessChainItemKey,
      ),
    [chain, firstChildnessChainItemKey],
  );

  const directoriesTree = useMemo(
    () =>
      getDirTreeRecursively(
        chain.filter((_) => _.type === 'dir'),
        0,
      ),
    [chain],
  );

  const handleEditPlaylist = (id: number) => {
    setCurrentEditingPlaylist(id);

    const playlist = (query.data || []).find((value) => value.id === id);

    editForm.setFieldValue('name', playlist?.name);
    editForm.setFieldValue('type', playlist?.type);
    editForm.setFieldValue(
      'directory',
      getDirKeyByFilehash(chain, (playlist?.fsMeta || [])[0]?.fileItemHash || '')?.key,
    );
  };
  const handleCancelEditing = () => {
    setCurrentEditingPlaylist(-1);
    editForm.resetFields();
  };
  const handleEditPlaylistFromModal = (data: { name: string; directory: string }) => {
    if (!currentPlaylist) {
      return;
    }

    setIsEditingInProgress(true);

    const dto: DtoUpdatePlaylist = {
      playlistData: {
        name: data.name,
        baseDirectory: '',
      },
      items: [],
    };

    if (currentPlaylist.type === 'fs') {
      dto.playlistData.baseDirectory =
        getDirChainItemByKey(chain, data.directory)?.fsItem?.filehash || undefined;
    }

    if (currentPlaylist.type === 'manual') {
      dto.items = transferSelected.map((tsItem, index) => ({
        order: index + 1,
        filehash: chain.find((_) => _.key === tsItem)?.fsItem?.filehash || '',
      }));
    }

    api.playlistsManager
      .updatePlaylist(currentPlaylist.id, dto)
      .catch((e) => {
        return messageApi.open({
          type: 'error',
          content: (e as Error).toString(),
        });
      })
      .finally(() => {
        setCurrentEditingPlaylist(-1);
        setIsEditingInProgress(false);
        setTransferSelected([]);
        editForm.resetFields();

        return query.refetch();
      });
  };

  const handleCreatePlaylist = () => setIsCreatingPlaylist(true);
  const handleCancelCreatePlaylist = () => {
    setIsCreatingPlaylist(false);
    createForm.resetFields();
  };
  const handleCreatePlaylistFromModal = (data: {
    directory: string;
    name: string;
    type: 'fs' | 'manual';
  }) => {
    setIsCreatingInProgress(true);
    const filehash = getDirChainItemByKey(chain, data.directory)?.fsItem?.filehash || undefined;

    api.playlistsManager
      .createPlaylist(data.name, data.type, filehash)
      .catch((e) => {
        return messageApi.open({
          type: 'error',
          content: (e as Error).toString(),
        });
      })
      .finally(() => {
        setIsCreatingPlaylist(false);
        setIsCreatingInProgress(false);
        createForm.resetFields();

        return query.refetch();
      });
  };

  const dataSource = (query.data || []).map((item) => {
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
          <Button onClick={() => handleEditPlaylist(item.id)} icon={<EditOutlined />} />

          <Button
            icon={<DeleteOutlined />}
            onClick={() =>
              api.playlistsManager.deletePlaylist(item.id).finally(() => query.refetch())
            }
          />
        </Space>
      ),
    };
  });

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

  const tracksHashes = queryItems.data?.map((_) => _.fileItemHash || '');
  const playlistTracks = chain.filter((_) =>
    tracksHashes?.includes(_.fsItem?.filehash || '__null__'),
  );

  const editModal = (
    <Modal
      title={`${currentPlaylist?.type === 'fs' ? 'Directory' : 'Manual'} playlist editing`}
      open={currentEditingPlaylist > -1}
      onCancel={handleCancelEditing}
      confirmLoading={isEditingInProgress}
      width='768px'
      footer={[
        <Button key='back' onClick={handleCancelEditing}>
          Cancel
        </Button>,
        <Button
          key='submit'
          type='primary'
          htmlType='submit'
          loading={isEditingInProgress}
          form='edit-playlist-form'
        >
          Save
        </Button>,
      ]}
    >
      <Space size='large' direction='vertical' style={{ width: '100%' }}>
        <Form
          name='edit-playlist-form'
          form={editForm}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          initialValues={{}}
          onFinish={handleEditPlaylistFromModal}
          onFinishFailed={console.error}
          autoComplete='off'
        >
          <Form.Item
            label='Name'
            name='name'
            rules={[{ required: true, message: 'This field required' }]}
            style={{ width: '480px' }}
          >
            <Input placeholder='Example: Retrowave by Oskar' />
          </Form.Item>

          {currentPlaylist?.type === 'fs' && (
            <Form.Item label='Directory' name='directory' style={{ width: '480px' }}>
              <TreeSelect
                placeholder='Just select? 🤔'
                treeLine={true}
                treeData={directoriesTree}
                onChange={(dirKey) => {
                  if (!dirKey) {
                    return;
                  }

                  const chainItem = getDirChainItemByKey(chain, dirKey as string);
                  if (chainItem) {
                    createForm.setFieldValue('name', chainItem.fsItem?.name || 'missed');
                    createForm.setFieldValue('type', 'fs');
                  } else {
                    notification.open({
                      message: 'Wrong data',
                      description:
                        'Unable to find extra data for selected directory. Try to select more deep directory.',
                    });
                  }
                }}
              />
            </Form.Item>
          )}

          {currentPlaylist?.type === 'manual' && (
            <Card title='Tracks bindings' size='small'>
              <TreeTransfer
                dataSource={transferTree}
                targetKeys={transferSelected}
                onChange={setTransferSelected}
              />
            </Card>
          )}
        </Form>

        <Card title='Tracks' size='small'>
          <List
            itemLayout='horizontal'
            dataSource={playlistTracks}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  style={{ alignItems: 'center' }}
                  avatar={
                    <Avatar
                      size={42}
                      shape='square'
                      src={api.scanner.getFileImageAsPath(item.fsItem?.filehash || '')}
                    />
                  }
                  description={`#${index + 1} ${item.fsItem?.metadata?.artist} - ${
                    item.fsItem?.metadata?.title
                  }`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </Modal>
  );

  const createModal = (
    <Modal
      title='Playlist creation'
      open={isCreatingPlaylist}
      onCancel={handleCancelCreatePlaylist}
      confirmLoading={isCreatingInProgress}
      footer={[
        <Button key='back' onClick={handleCancelCreatePlaylist}>
          Cancel
        </Button>,
        <Button
          key='submit'
          type='primary'
          htmlType='submit'
          loading={isCreatingInProgress}
          form='create-playlist-form'
        >
          Create
        </Button>,
      ]}
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card size='small'>
          <Typography.Text style={{ fontSize: '12px' }}>
            <Typography.Text strong>
              <QuestionCircleOutlined /> Hint:
            </Typography.Text>{' '}
            Skip filling &quot;Name&quot; and &quot;Type&quot; fields, if you want create
            &quot;Directory&quot; playlist. If you select &quot;Directory&quot; field,
            &quot;Name&quot; and &quot;Type&quot; will be filled automatically! ✨
          </Typography.Text>
        </Card>

        <Form
          name='create-playlist-form'
          form={createForm}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          initialValues={{}}
          onFinish={handleCreatePlaylistFromModal}
          onFinishFailed={console.error}
          autoComplete='off'
        >
          <Form.Item
            label='Name'
            name='name'
            rules={[{ required: true, message: 'This field required' }]}
          >
            <Input placeholder='Example: Retrowave by Oskar' />
          </Form.Item>

          <Form.Item
            label='Type'
            name='type'
            rules={[{ required: true, message: 'This field required' }]}
          >
            <Select
              placeholder='Example: Directory'
              defaultValue={undefined}
              options={[
                { value: 'fs', label: 'Directory' },
                { value: 'manual', label: 'Manual' },
              ]}
            />
          </Form.Item>

          <Form.Item label='Directory' name='directory'>
            <TreeSelect
              placeholder='Just select? 🤔'
              treeLine={true}
              treeData={directoriesTree}
              onChange={(dirKey) => {
                if (!dirKey) {
                  return;
                }

                const chainItem = getDirChainItemByKey(chain, dirKey as string);
                if (chainItem) {
                  createForm.setFieldValue('name', chainItem.fsItem?.name || 'missed');
                  createForm.setFieldValue('type', 'fs');
                } else {
                  notification.open({
                    message: 'Wrong data',
                    description:
                      'Cant find extra data for selected directory. Try to select more deep directory.',
                  });
                }
              }}
            />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );

  return (
    <>
      {createModal}

      {editModal}

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
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Card>
    </>
  );
};

PlaylistsPage.Layout = AdminLayout;
PlaylistsPage.Title = 'nesorter :: playlists';
export default PlaylistsPage;
export const getServerSideProps = withDefaultPageProps(async () => {
  const playlists = await api.playlistsManager.getPlaylists().then((items) => items.data);

  return {
    props: {
      playlists,
    },
  };
});
