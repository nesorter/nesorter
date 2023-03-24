import { useStore } from '@nanostores/react';
import { Typography } from 'antd';
import React from 'react';

import { StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';

export const SelectTrackMessage = () => {
  const { selectedTrack, classEditMode } = useStore(StoreClassifyPage);

  if (Boolean(selectedTrack) || classEditMode) {
    return null;
  }

  return (
    <Typography.Text>
      Select track in <Typography.Text strong>Library explorer</Typography.Text>
    </Typography.Text>
  );
};
