import { Card } from 'antd';
import React, { PropsWithChildren } from 'react';

export const SelectedTrackWrapper = ({ children }: PropsWithChildren) => {
  return (
    <Card title='Classificator' style={{ width: 'calc(100vw - 480px)' }}>
      {children}
    </Card>
  );
};
