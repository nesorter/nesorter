import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { List, Typography } from 'antd';

import type { AggregatedScheduleItem } from '@/radio-service/types';

export const ScheduleItemPlaylists = (item: AggregatedScheduleItem) => {
  return (
    <>
      <Typography.Text>Playlists:</Typography.Text>

      <List
        size='small'
        dataSource={item.playlists}
        renderItem={(item) => (
          <List.Item>{`#${item.playlist?.id} ${item.playlist?.name}`}</List.Item>
        )}
        bordered
        header={
          <Typography.Text>
            <Typography.Text>{'Merging mode '}</Typography.Text>

            {item.withMerging > 0 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          </Typography.Text>
        }
      />
    </>
  );
};
