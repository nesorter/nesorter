import { useStore } from '@nanostores/react';
import { List } from 'antd';
import React from 'react';

import { ClassEditItem } from '@/client/pages/ClassificatorPage/components/ClassEditItem';
import { StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';

export const ClassEditor = () => {
  const { classEditMode, categories } = useStore(StoreClassifyPage);

  if (!classEditMode) {
    return null;
  }

  return (
    <List dataSource={categories} itemLayout='vertical' rowKey='id' renderItem={ClassEditItem} />
  );
};
