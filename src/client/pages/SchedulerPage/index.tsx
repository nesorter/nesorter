import { useStore } from '@nanostores/react';
import { Card, Form, List } from 'antd';

import { AdminLayout } from '@/client/layouts/AdminLayout';
import { Extra } from '@/client/pages/SchedulerPage/components/Extra';
import { ScheduleItem } from '@/client/pages/SchedulerPage/components/ScheduleItem';
import { StoreSchedulerPage } from '@/client/pages/SchedulerPage/store';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const SchedulerPage = () => {
  const { scheduleItems, sortMode, scheduleItemsFetching } = useStore(StoreSchedulerPage);
  const [form] = Form.useForm();

  if (scheduleItemsFetching) {
    return null;
  }

  return (
    <Card title='Schedule items' style={{ width: '100%' }} extra={<Extra />}>
      <List
        dataSource={scheduleItems
          .sort((a, b) => (sortMode === 'id' ? a.id - b.id : a.startAt - b.startAt))
          .map((_) => ({ form, item: _ }))}
        itemLayout='vertical'
        rowKey={(_) => _.item.id}
        renderItem={ScheduleItem}
      />
    </Card>
  );
};

SchedulerPage.Layout = AdminLayout;
SchedulerPage.Title = 'nesorter :: scheduler';
export default SchedulerPage;
export const getServerSideProps = withDefaultPageProps();
