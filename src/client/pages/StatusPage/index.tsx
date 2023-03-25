import { Space } from 'antd';

import { AdminLayout } from '@/client/layouts/AdminLayout';
import { SystemActions } from '@/client/pages/StatusPage/components/SystemActions';
import { SystemQueues } from '@/client/pages/StatusPage/components/SystemQueues';
import { SystemStatus } from '@/client/pages/StatusPage/components/SystemStatus';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const StatusPage = () => {
  return (
    <Space align='start' size='middle'>
      <Space direction='vertical' size='middle'>
        <SystemStatus />

        <SystemActions />
      </Space>

      <SystemQueues />
    </Space>
  );
};

StatusPage.Layout = AdminLayout;
StatusPage.Title = 'nesorter :: status';
export default StatusPage;
export const getServerSideProps = withDefaultPageProps();
