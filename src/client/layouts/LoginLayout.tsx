import { blue } from '@ant-design/colors';
import { Layout, Space, Typography } from 'antd';
import { CSSProperties } from 'react';

import { Layout as LayoutType } from '@/client/types/Layout';

const rootLayoutStyles: CSSProperties = {
  minHeight: '100%',
};

export const LoginLayout: LayoutType = ({ children }) => {
  return (
    <Layout style={rootLayoutStyles}>
      <Layout.Header>
        <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text style={{ color: blue[0], fontSize: '24px' }}>nesorter</Typography.Text>
        </Space>
      </Layout.Header>

      <Layout style={{ justifyContent: 'center', alignItems: 'center' }}>{children}</Layout>
    </Layout>
  );
};
