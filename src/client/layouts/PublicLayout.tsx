import { blue } from '@ant-design/colors';
import { UserOutlined } from '@ant-design/icons';
import { Layout, Space, Typography } from 'antd';
import { CSSProperties } from 'react';

import { Layout as LayoutType } from '@/client/types/Layout';

import styles from './PublicLayout.module.css';

const rootLayoutStyles: CSSProperties = {
  minHeight: '100%',
};

const footerStyles: CSSProperties = { textAlign: 'center' };

export const PublicLayout: LayoutType = ({ children, version }) => {
  return (
    <Layout style={rootLayoutStyles}>
      <Layout.Header>
        <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text style={{ color: blue[0], fontSize: '24px' }}>nesorter</Typography.Text>

          <Typography.Link href='/admin/status' target='_blank'>
            Administration <UserOutlined />
          </Typography.Link>
        </Space>
      </Layout.Header>

      <Layout>
        <Layout.Content>
          <Space className={styles.root}>{children}</Space>
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
