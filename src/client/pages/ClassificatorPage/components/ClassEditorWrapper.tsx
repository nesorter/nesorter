import { Button, Card } from 'antd';
import React, { PropsWithChildren } from 'react';

import { handleCreateNewGroup } from '@/client/pages/ClassificatorPage/store';

export const ClassEditorWrapper = ({ children }: PropsWithChildren) => {
  return (
    <Card
      title={'Editing class groups'}
      style={{ width: 'calc(100vw - 480px)' }}
      extra={
        <Button type='primary' onClick={() => handleCreateNewGroup()}>
          Create new group
        </Button>
      }
    >
      {children}
    </Card>
  );
};
