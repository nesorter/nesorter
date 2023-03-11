import {
  CaretDownOutlined,
  CaretUpOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, List, Slider, Space, Spin, Switch, Tooltip, Typography } from 'antd';
import { differenceInSeconds, endOfDay, secondsInDay } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import { api } from '@/client/api';
import { useChain } from '@/client/hooks/queries/useChain';
import { useStatus } from '@/client/hooks/queries/useStatus';
import { PublicLayout } from '@/client/layouts/PublicLayout';
import type { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { formatTime } from '@/client/utils/formatTime';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';
import type { ServiceStatus } from '@/radio-service/types/ServiceStatus';

const currentSecondsFromDayStart = () => {
  return secondsInDay - differenceInSeconds(endOfDay(new Date()), new Date());
};

const LandingPage = ({
  status,
}: WithDefaultPageProps<{
  status: ServiceStatus;
}>) => {
  const chainQuery = useChain();
  const statusQuery = useStatus(status);
  const [currentSeconds, setCurrentSeconds] = useState(currentSecondsFromDayStart());
  const [isSimulating, setIsSimulating] = useState(status.streaming !== true);

  const currentChainItem = useMemo(
    () => chainQuery.data?.find((_) => _.fsItem?.filehash === statusQuery?.data?.currentFile),
    [chainQuery.data, statusQuery?.data?.currentFile],
  );

  const currentQueueItem = useMemo(
    () =>
      statusQuery.data?.queue?.items?.find((_) => _.fileHash === statusQuery?.data?.currentFile),
    [statusQuery.data?.queue?.items, statusQuery?.data?.currentFile],
  );

  const [audio, setAudio] = useState<HTMLAudioElement | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartPlay = () => {
    if (audio) {
      if (statusQuery.data?.streaming) {
        audio.src = `${statusQuery?.data?.steamUrl || ''}?no-cache=${Date.now()}`;
      }

      setIsPlaying(true);
    }
  };

  const handleStopPlay = () => {
    if (audio) {
      audio.src = '';
      setIsPlaying(false);
    }
  };

  const handleVolume = (value: number) => {
    if (audio) {
      audio.volume = value / 100;
    }
  };

  useEffect(() => {
    if (audio && isPlaying && isSimulating) {
      if (!statusQuery.data?.streaming && statusQuery.data?.playing) {
        audio.pause();
        audio.src = api.scanner.getFileAsPath(currentChainItem?.fsItem?.filehash || '');
        const seekTo = currentSeconds - Number(currentQueueItem?.startAt);
        audio.fastSeek(seekTo > 0 ? (seekTo < Number(currentQueueItem?.endAt) ? seekTo : 0) : 0);
        audio.play().catch(console.log);
      }
    }
  }, [currentChainItem?.fsItem?.filehash]);

  useEffect(() => {
    if (audio) {
      if (isPlaying && isSimulating) {
        audio.src = api.scanner.getFileAsPath(currentChainItem?.fsItem?.filehash || '');
        audio.play().catch(console.error);

        if (!statusQuery.data?.streaming && statusQuery.data?.playing) {
          const seekTo = currentSeconds - Number(currentQueueItem?.startAt);
          audio.fastSeek(seekTo > 0 ? (seekTo < Number(currentQueueItem?.endAt) ? seekTo : 0) : 0);
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudio(new Audio());
    }
    setInterval(() => {
      setCurrentSeconds(currentSecondsFromDayStart());
    }, 2000);
  }, []);

  if (chainQuery.isFetching) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          maxWidth: 'calc(100vw - 125px)',
          height: '100%',
        }}
      >
        <Spin tip='Loading' size='large'>
          <div
            className='content'
            style={{
              padding: '50px',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
            }}
          />
        </Spin>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        maxWidth: 'calc(100vw - 125px)',
        height: '100%',
      }}
    >
      <Space direction='vertical' size='small'>
        <Card title='Now playling' style={{ width: '798px' }} size='small'>
          <Space direction='vertical'>
            <Typography.Text>
              <Typography.Text strong>{'Playlist: '}</Typography.Text>

              {statusQuery.data?.playlistData?.name}
            </Typography.Text>

            <Typography.Text>
              <Typography.Text strong>{'Track: '}</Typography.Text>

              {`${currentChainItem?.fsItem?.metadata?.artist} - ${currentChainItem?.fsItem?.metadata?.title}`}
            </Typography.Text>
          </Space>
        </Card>

        <Space align='start' size='small' wrap>
          <Space direction='vertical'>
            <Card title='Player' style={{ width: '284px' }} size='small'>
              {statusQuery.data?.playing ? (
                <Space direction='vertical' align='center' style={{ width: '256px' }}>
                  <Avatar
                    size={256}
                    shape='square'
                    src={api.scanner.getFileImageAsPath(currentChainItem?.fsItem?.filehash || '')}
                  />

                  <Space>
                    <Slider
                      style={{ width: '256px' }}
                      min={currentQueueItem?.startAt}
                      max={currentQueueItem?.endAt}
                      value={currentSeconds}
                      disabled
                    />
                  </Space>

                  <Space>
                    <Button onClick={isPlaying ? handleStopPlay : handleStartPlay}>
                      {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    </Button>

                    <Space>
                      <CaretDownOutlined />

                      <Slider
                        style={{ width: '120px' }}
                        min={1}
                        max={100}
                        defaultValue={100}
                        onChange={(e) => handleVolume(e)}
                      />

                      <CaretUpOutlined />
                    </Space>
                  </Space>
                </Space>
              ) : (
                <Typography.Text>
                  Right now nothing playing. Try to start queue in admin panel.
                </Typography.Text>
              )}
            </Card>

            <Card style={{ width: '284px' }}>
              <Space size='large' wrap>
                <Switch disabled checked={isSimulating} onChange={(e) => setIsSimulating(e)} />

                <Typography.Text>
                  {'Simulate-mode '}

                  <Tooltip title='Allows the player to simulate broadcast behavior. Always enabled when there is a queue and no broadcasting'>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Typography.Text>
              </Space>
            </Card>
          </Space>

          <Space direction='vertical'>
            <Card title='Queue' size='small'>
              <List
                dataSource={status.queue?.items}
                rowKey='order'
                size='small'
                style={{ width: '480px', maxHeight: '428px', overflowY: 'auto' }}
                renderItem={(item) => {
                  const chainItem = chainQuery.data?.find(
                    (_) => _.fsItem?.filehash === item.fileHash,
                  );

                  return (
                    <List.Item>
                      <List.Item.Meta
                        style={{ alignItems: 'flex-end' }}
                        title={`${item.order}: ${formatTime(item.startAt)} - ${formatTime(
                          item.endAt,
                        )}`}
                        description={`${chainItem?.fsItem?.metadata?.artist} - ${chainItem?.fsItem?.metadata?.title}`}
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>
          </Space>
        </Space>
      </Space>
    </div>
  );
};

LandingPage.Layout = PublicLayout;
export default LandingPage;
export const getServerSideProps = withDefaultPageProps(async () => {
  const status = await api.logger.getStatus().then((_) => _.data);

  return {
    props: {
      adminSide: false,
      status,
    },
  };
});
