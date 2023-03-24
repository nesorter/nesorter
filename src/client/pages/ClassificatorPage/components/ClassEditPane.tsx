import { useStore } from '@nanostores/react';
import { Button, Card, Typography } from 'antd';
import React from 'react';

import { setClassEditMode, StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';

export const ClassEditPane = () => {
  const { classEditMode } = useStore(StoreClassifyPage);

  return (
    <Card
      title='Classes'
      extra={
        <Button onClick={() => setClassEditMode(!classEditMode)}>
          {classEditMode ? 'End editing' : 'Edit'}
        </Button>
      }
    >
      <Typography.Text>
        Click <Typography.Text strong>Edit</Typography.Text> to modify
      </Typography.Text>
    </Card>
  );
};
