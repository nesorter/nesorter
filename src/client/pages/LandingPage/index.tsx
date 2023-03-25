import { useStore } from '@nanostores/react';
import { Card, Space, Typography } from 'antd';

import { PublicLayout } from '@/client/layouts/PublicLayout';
import { FetchingBox } from '@/client/pages/LandingPage/components/FetchingBox';
import { NowPlaying } from '@/client/pages/LandingPage/components/NowPlaying';
import { Player } from '@/client/pages/LandingPage/components/Player';
import { Queue } from '@/client/pages/LandingPage/components/Queue';
import { SimulateBox } from '@/client/pages/LandingPage/components/SimulateBox';
import { StoreLandingPage } from '@/client/pages/LandingPage/store';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

import styles from './styles.module.css';

const LandingPage = () => {
  const { status, isFetching } = useStore(StoreLandingPage);

  if (isFetching) {
    return (
      <div className={styles.root}>
        <FetchingBox />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Space direction='vertical' size='small'>
        <NowPlaying />

        <Space className={styles.content} align='start' size='small' wrap>
          <Space direction='vertical'>
            <Card title='Player' className={styles.player} size='small'>
              {status?.playing ? (
                <Player />
              ) : (
                <Typography.Text>
                  Right now nothing playing. Try to start queue in admin panel.
                </Typography.Text>
              )}
            </Card>

            <SimulateBox />
          </Space>

          <Space direction='vertical'>
            <Queue />
          </Space>
        </Space>
      </Space>
    </div>
  );
};

LandingPage.Layout = PublicLayout;
LandingPage.Title = 'nesorter :: player';
export default LandingPage;
export const getServerSideProps = withDefaultPageProps(() => {
  return Promise.resolve({
    props: {
      adminSide: false,
    },
  });
});
