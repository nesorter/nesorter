import { useStore } from '@nanostores/react';
import { Button, List, Space, Typography } from 'antd';
import { FormInstance } from 'antd';
import React from 'react';

import { ClassEditItemForm } from '@/client/pages/ClassificatorPage/components/ClassEditItemForm';
import { setCurrentCategoryId, StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';
import type { AggregatedClassCategory } from '@/radio-service/types';

export const ClassEditItem = ({
  editCategoryForm,
  item,
}: {
  editCategoryForm: FormInstance;
  item: AggregatedClassCategory;
}) => {
  const { currentCategoryId, categories } = useStore(StoreClassifyPage);

  const handleCategoryEdit = (categoryId: number) => {
    setCurrentCategoryId(categoryId);

    const category = categories.find((_) => _.id === categoryId);
    editCategoryForm.setFieldValue('name', category?.name);
    editCategoryForm.setFieldValue('values', category?.items || []);
  };

  const extraButtons =
    currentCategoryId === item.id
      ? []
      : [
          <Button key='edit-btn' onClick={() => handleCategoryEdit(item.id)}>
            Edit
          </Button>,
        ];

  let editForm = null;

  if (currentCategoryId === item.id) {
    editForm = <ClassEditItemForm editCategoryForm={editCategoryForm} />;
  }

  return (
    <List.Item extra={extraButtons}>
      <Space direction='vertical' size='large'>
        <Typography.Text>{`#${item.id}: ${item.name}`}</Typography.Text>

        {editForm}
      </Space>
    </List.Item>
  );
};
