import { Button, Card } from 'antd';
import React, { PropsWithChildren } from 'react';

import { api } from '@/client/api';
import { initCategories } from '@/client/pages/ClassificatorPage/store';

export const ClassEditorWrapper = ({ children }: PropsWithChildren) => {
  const handleCreateNewGroup = () => {
    api.categories
      .create({
        name: 'New unnamed category',
        values: ['First value', 'Second value'],
      })
      .finally(() => initCategories());
  };

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
