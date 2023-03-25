import {
  CaretDownOutlined,
  CaretUpOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useStore } from '@nanostores/react';
import { Avatar, Button, Slider, Space } from 'antd';

import { api } from '@/client/api';
import {
  handleStartPlay,
  handleStopPlay,
  handleVolume,
  StoreLandingPage,
} from '@/client/pages/LandingPage/store';
import { formatTimeWithSeconds } from '@/client/utils/formatTime';

export const Player = () => {
  const { isPlaying, currentChainItem, currentQueueItem, currentSeconds } =
    useStore(StoreLandingPage);

  return (
    <Space direction='vertical' align='center' style={{ width: '256px' }}>
      <Avatar
        size={256}
        shape='square'
        src={api.scanner.getFileImageAsPath(currentChainItem?.fsItem?.filehash || '')}
      />

      <Space>
        <Slider
          style={{ width: '256px' }}
          min={0}
          max={Number(currentQueueItem?.endAt) - Number(currentQueueItem?.startAt)}
          value={currentSeconds - Number(currentQueueItem?.startAt)}
          tooltip={{
            formatter: formatTimeWithSeconds,
          }}
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
  );
};
