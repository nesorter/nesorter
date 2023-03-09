import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, TreeSelect, Typography, Upload, UploadFile } from 'antd';
import { useMemo, useState } from 'react';

import { AdminLayout } from '@/client/layouts/AdminLayout';
import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { getDirTreeRecursively } from '@/client/utils/recursiveTrees';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

import sendMultipartFormData from '../../api/sendMultipartFormData';

const UploadPage = ({ chain }: WithDefaultPageProps) => {
  const [form] = Form.useForm();

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const directoriesTree = useMemo(
    () =>
      getDirTreeRecursively(
        chain.filter((_) => _.type === 'dir'),
        0,
      ),
    [chain],
  );

  const handleUpload = (data: {
    baseDirKey: string;
    newDirName: string;
    files: { fileList: UploadFile[] };
  }) => {
    if (!/^([a-zA-Z]|\d|_)*$/.test(data.newDirName)) {
      alert('Wrong name for new directory: allowed latin, numbers and symbol "_"');
      return;
    }

    setIsUploading(true);

    const path = chain.find((_) => _.key === data.baseDirKey)?.path || '';
    const formData = new FormData();
    formData.append('path', `/${path}`);
    formData.append('newDir', data.newDirName);

    data.files.fileList.forEach((file, index) => {
      if (file.originFileObj) {
        formData.append(`file_${index}`, file.originFileObj);
      }
    });

    sendMultipartFormData({
      onUploadProgress: (v) => setProgress(v),
      form: formData,
      url: '/api/scanner/upload-files',
    })
      .then(() => alert('Done. Run scan at status page'))
      .catch(() => alert('failed'))
      .finally(() => {
        setIsUploading(false);
        setFileList([]);
        setProgress(0);
        form.resetFields();
      });
  };

  return (
    <Card title='Upload music into library'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Card
          style={{ width: 'calc(100% - 344px)' }}
          title='Upload form'
          size='small'
          extra={isUploading && `Uploaded: ${Math.round(progress * 1000) / 1000}%`}
        >
          <Form
            form={form}
            name='login-form'
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
            style={{ width: '100%' }}
            onFinish={handleUpload}
            onFinishFailed={console.error}
            autoComplete='off'
          >
            <Form.Item
              label='Base directory'
              name='baseDirKey'
              rules={[{ required: true, message: 'This field required' }]}
            >
              <TreeSelect
                placeholder='Just select? 🤔'
                treeLine={true}
                treeData={directoriesTree}
              />
            </Form.Item>

            <Form.Item
              label='New directory name'
              name='newDirName'
              rules={[{ required: true, message: 'This field required' }]}
            >
              <Input placeholder='Example: Guano_Apes_My_Essentials' />
            </Form.Item>

            <Form.Item
              label='Files'
              name='files'
              rules={[{ required: true, message: 'This field required' }]}
            >
              <Upload
                multiple
                onRemove={(file) => {
                  const index = fileList.indexOf(file);
                  setFileList(fileList.slice().splice(index, 1));
                }}
                beforeUpload={(file) => {
                  setFileList((list) => [...list, file]);
                  return false;
                }}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>Click to select</Button>
              </Upload>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 7, span: 15 }}>
              <Button type='primary' htmlType='submit' loading={isUploading}>
                Upload
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title={
            <>
              <InfoCircleOutlined /> Before filling fields
            </>
          }
          style={{
            width: '100%',
            maxWidth: 320,
          }}
          size='small'
        >
          <Space direction='vertical'>
            <Typography.Text>
              Abstractly, the download process looks like this: a new directory is created in the
              base directory and the downloaded files are stored in it.
            </Typography.Text>

            <Typography.Text>
              You need to select a base directory, name the new directory, and select files.
            </Typography.Text>
          </Space>
        </Card>
      </div>
    </Card>
  );
};

UploadPage.Layout = AdminLayout;
export default UploadPage;
export const getServerSideProps = withDefaultPageProps(() => Promise.resolve({ props: {} }));
