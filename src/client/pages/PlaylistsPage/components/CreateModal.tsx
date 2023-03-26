import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStore } from '@nanostores/react';
import {
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  Modal,
  notification,
  Select,
  Space,
  TreeSelect,
  Typography,
} from 'antd';

import {
  handleCancelCreatePlaylist,
  handleCreatePlaylistFromModal,
  StorePlaylistsPage,
} from '@/client/pages/PlaylistsPage/store';
import { getDirChainItemByKey } from '@/client/utils/recursiveTrees';

export const CreateModal = ({ createForm }: { createForm: FormInstance }) => {
  const { isCreatingPlaylist, isCreatingInProgress, directoriesTree, chain } =
    useStore(StorePlaylistsPage);

  return (
    <Modal
      title='Playlist creation'
      open={isCreatingPlaylist}
      onCancel={() => handleCancelCreatePlaylist(createForm)}
      confirmLoading={isCreatingInProgress}
      footer={[
        <Button key='back' onClick={() => handleCancelCreatePlaylist(createForm)}>
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          onFinish={(data) => handleCreatePlaylistFromModal(data, createForm)}
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
};
