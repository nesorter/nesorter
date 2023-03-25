import { useStore } from '@nanostores/react';
import { Card, List } from 'antd';

import { StoreLandingPage } from '@/client/pages/LandingPage/store';
import styles from '@/client/pages/LandingPage/styles.module.css';
import { formatTime } from '@/client/utils/formatTime';

export const Queue = () => {
  const { status, chain } = useStore(StoreLandingPage);

  return (
    <Card title='Queue' size='small'>
      <List
        dataSource={status?.queue?.items}
        rowKey='order'
        size='small'
        className={styles.list}
        renderItem={(item) => {
          const chainItem = chain?.find((_) => _.fsItem?.filehash === item.fileHash);

          return (
            <List.Item>
              <List.Item.Meta
                style={{ alignItems: 'flex-end' }}
                title={`${item.order}: ${formatTime(item.startAt)} - ${formatTime(item.endAt)}`}
                description={`${chainItem?.fsItem?.metadata?.artist} - ${chainItem?.fsItem?.metadata?.title}`}
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};
