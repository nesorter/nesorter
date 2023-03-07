import { blue } from '@ant-design/colors';
import {
  ApartmentOutlined,
  CloudUploadOutlined,
  FieldTimeOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { Layout, Menu, MenuProps, Space, Typography } from 'antd';
import { useRouter } from 'next/router';
import { CSSProperties, useState } from 'react';

import { Layout as LayoutType } from '@/client/types/Layout';

const rootLayoutStyles: CSSProperties = {
  minHeight: '100%',
};

const footerStyles: CSSProperties = { textAlign: 'center' };

const items: MenuProps['items'] = [
  {
    label: 'Status',
    key: '/admin/status',
    icon: <InfoCircleOutlined />,
  },
  {
    label: 'Classificator',
    key: '/admin/classificator',
    icon: <ApartmentOutlined />,
  },
  {
    label: 'Playlists',
    key: '/admin/playlists',
    icon: <OrderedListOutlined />,
  },
  {
    label: 'Scheduler',
    key: '/admin/scheduler',
    icon: <FieldTimeOutlined />,
  },
  {
    label: 'Upload',
    key: '/admin/upload',
    icon: <CloudUploadOutlined />,
  },
];

export const AdminLayout: LayoutType = ({ children, version }) => {
  const router = useRouter();
  const [current, setCurrent] = useState(router.pathname);

  const handleNavigate: MenuProps['onClick'] = (e) => {
    router.push(e.key).catch(console.error);
    setCurrent(e.key);
  };

  return (
    <Layout style={rootLayoutStyles}>
      <Layout.Header>
        <Space align='center'>
          <Typography.Text style={{ color: blue[0], fontSize: '24px', marginRight: '38px' }}>
            nesorter
          </Typography.Text>

          <Menu
            theme='dark'
            onClick={handleNavigate}
            selectedKeys={[current]}
            mode='horizontal'
            items={items}
            disabledOverflow
          />
        </Space>
      </Layout.Header>

      <Layout>
        <Layout.Content>
          <Space style={{ padding: '24px' }}>{children}</Space>
        </Layout.Content>
      </Layout>

      <Layout.Footer style={footerStyles}>
        <Space>
          <Typography.Text strong>nesorter v{version}</Typography.Text>

          <Typography.Text>
            {'created by '}

            <Typography.Link href='https://kugi.club/' target='_blank'>
              Andrew Goncharov
            </Typography.Link>
          </Typography.Text>
        </Space>
      </Layout.Footer>
    </Layout>
  );
};
