import { blue } from '@ant-design/colors';
import { Layout, Space, Typography } from 'antd';
import { CSSProperties } from 'react';

import { Layout as LayoutType } from '@/client/types/Layout';

const rootLayoutStyles: CSSProperties = {
  minHeight: '100%',
};

const footerStyles: CSSProperties = { textAlign: 'center' };

export const LoginLayout: LayoutType = ({ children, version }) => {
  return (
    <Layout style={rootLayoutStyles}>
      <Layout.Header>
        <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text style={{ color: blue[0], fontSize: '24px' }}>nesorter</Typography.Text>
        </Space>
      </Layout.Header>

      <Layout style={{ justifyContent: 'center', alignItems: 'center' }}>{children}</Layout>

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
