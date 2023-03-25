import { useStore } from '@nanostores/react';
import { Card, Space, Typography } from 'antd';

import { StoreLandingPage } from '@/client/pages/LandingPage/store';
import styles from '@/client/pages/LandingPage/styles.module.css';

export const NowPlaying = () => {
  const { status, currentChainItem } = useStore(StoreLandingPage);

  if (!Boolean(currentChainItem?.fsItem?.metadata?.artist)) {
    return null;
  }

  return (
    <Card title='Now playling' className={styles.nowPlaying} size='small'>
      <Space direction='vertical' wrap>
        <Typography.Text>
          <Typography.Text strong>{'Playlist: '}</Typography.Text>

          {status?.playlistData?.name}
        </Typography.Text>

        <Typography.Text>
          <Typography.Text strong>{'Track: '}</Typography.Text>

          {`${currentChainItem?.fsItem?.metadata?.artist} - ${currentChainItem?.fsItem?.metadata?.title}`}
        </Typography.Text>
      </Space>
    </Card>
  );
};
