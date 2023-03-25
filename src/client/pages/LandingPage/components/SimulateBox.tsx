import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStore } from '@nanostores/react';
import { Card, Space, Switch, Tooltip, Typography } from 'antd';

import { setIsSimulating, StoreLandingPage } from '@/client/pages/LandingPage/store';
import styles from '@/client/pages/LandingPage/styles.module.css';

export const SimulateBox = () => {
  const { isSimulating } = useStore(StoreLandingPage);

  return (
    <Card className={styles.player}>
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
  );
};
