import { useStore } from '@nanostores/react';
import {
  Avatar,
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  List,
  Modal,
  notification,
  Space,
  TreeSelect,
} from 'antd';

import { api } from '@/client/api';
import { TreeTransfer } from '@/client/pages/PlaylistsPage/components/TreeTransfer';
import {
  handleCancelEditing,
  handleEditPlaylistFromModal,
  setTransferSelected,
  StorePlaylistsPage,
} from '@/client/pages/PlaylistsPage/store';
import { getDirChainItemByKey } from '@/client/utils/recursiveTrees';

export const EditModal = ({
  createForm,
  editForm,
}: {
  createForm: FormInstance;
  editForm: FormInstance;
}) => {
  const {
    currentPlaylist,
    playlistItems,
    currentEditingPlaylist,
    isEditingInProgress,
    transferTree,
    directoriesTree,
    transferSelected,
    chain,
  } = useStore(StorePlaylistsPage);

  const tracksHashes = playlistItems?.map((_) => _.fileItemHash || '');
  const playlistTracks = chain.filter((_) =>
    tracksHashes?.includes(_.fsItem?.filehash || '__null__'),
  );

  return (
    <Modal
      title={`${currentPlaylist?.type === 'fs' ? 'Directory' : 'Manual'} playlist editing`}
      open={currentEditingPlaylist > -1}
      onCancel={() => handleCancelEditing(editForm)}
      confirmLoading={isEditingInProgress}
      width='768px'
      footer={[
        <Button key='back' onClick={() => handleCancelEditing(editForm)}>
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          onFinish={(data) => handleEditPlaylistFromModal(data, editForm)}
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
                onChange={(data) => setTransferSelected(data)}
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
};
