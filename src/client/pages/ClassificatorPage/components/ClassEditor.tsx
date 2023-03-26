import { useStore } from '@nanostores/react';
import { FormInstance, List } from 'antd';
import React from 'react';

import { ClassEditItem } from '@/client/pages/ClassificatorPage/components/ClassEditItem';
import { StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';

export const ClassEditor = ({ editCategoryForm }: { editCategoryForm: FormInstance }) => {
  const { classEditMode, categories, categoriesFetch } = useStore(StoreClassifyPage);

  if (!classEditMode) {
    return null;
  }

  if (categoriesFetch) {
    return null;
  }

  return (
    <List
      dataSource={categories.map((_) => ({ editCategoryForm, item: _ }))}
      itemLayout='vertical'
      rowKey={(_) => _.item.id}
      renderItem={ClassEditItem}
    />
  );
};
