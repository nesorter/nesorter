import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useStore } from '@nanostores/react';
import { Button, Form, FormInstance, Input, Space } from 'antd';
import React from 'react';

import { api } from '@/client/api';
import {
  initCategories,
  setCurrentCategoryId,
  StoreClassifyPage,
} from '@/client/pages/ClassificatorPage/store';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 16, offset: 5 },
  },
};

export const ClassEditItemForm = ({ editCategoryForm }: { editCategoryForm: FormInstance }) => {
  const { currentCategoryId } = useStore(StoreClassifyPage);

  const handleSaveCategoryEdit = (data: {
    name: string;
    values: { id?: number; value: string }[];
  }) => {
    api.categories
      .update({
        id: currentCategoryId,
        values: data.values,
        name: data.name,
      })
      .catch(console.error)
      .finally(() => {
        setCurrentCategoryId(-1);
        editCategoryForm.resetFields();
        return initCategories();
      });
  };

  return (
    <Form
      form={editCategoryForm}
      name='edit-category-form'
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      style={{ width: 480 }}
      initialValues={{}}
      onFinish={handleSaveCategoryEdit}
      onFinishFailed={console.error}
      autoComplete='off'
    >
      <Form.Item name='name' label='Name'>
        <Input />
      </Form.Item>

      <Form.List name='values'>
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                label={index === 0 ? 'Values' : ''}
                required={false}
                key={field.key}
              >
                <Space key={field.key} align='baseline'>
                  <Form.Item {...field} name={[field.name, 'id']} noStyle>
                    <Input placeholder='' style={{ width: '50px' }} disabled />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'value']}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: 'Please value or delete this field.',
                      },
                    ]}
                    noStyle
                  >
                    <Input placeholder='Value' style={{ width: '230px' }} />
                  </Form.Item>

                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className='dynamic-delete-button'
                      onClick={() => remove(field.name)}
                      style={{ marginLeft: '10px' }}
                    />
                  ) : null}
                </Space>
              </Form.Item>
            ))}

            <Form.Item {...formItemLayoutWithOutLabel}>
              <Button
                type='dashed'
                onClick={() => add()}
                style={{ width: '60%' }}
                icon={<PlusOutlined />}
              >
                Add value
              </Button>

              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
        <Button type='primary' htmlType='submit'>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};
