import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, List, Space, Tree, Typography } from 'antd';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import { api } from '@/client/api';
import { useCatalogs } from '@/client/hooks/queries/useCatalogs';
import { useSelectedFileItem } from '@/client/hooks/queries/useSelectedFileItem';
import { useFirstChildnessChainItemKey } from '@/client/hooks/useFirstChildnessChainItemKey';
import { AdminLayout } from '@/client/layouts/AdminLayout';
import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { getDirTreeRecursively } from '@/client/utils/recursiveTrees';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';
import type { AggregatedClassCategory } from '@/radio-service/types/Classificator';

const ClassificatorPage = ({
  chain,
  catalogs,
}: WithDefaultPageProps<{ catalogs: AggregatedClassCategory[] }>) => {
  const firstChildnessChainItemKey = useFirstChildnessChainItemKey(chain);
  const tree = useMemo(
    () =>
      getDirTreeRecursively(
        chain.filter((_) => _.fsItem?.type !== 'dir'),
        1,
        firstChildnessChainItemKey,
      ),
    [chain, firstChildnessChainItemKey],
  );

  const [classEditMode, setClassEditMode] = useState(false);
  const [selectedTrackKey, setSelectedTrackKey] = useState<string | undefined>(undefined);
  const selectedTrack = chain.find((_) => _.key === selectedTrackKey && _.fsItem?.type === 'file');

  const categoriesQuery = useCatalogs(catalogs);
  const trackQuery = useSelectedFileItem(selectedTrack?.fsItem?.filehash);

  const [editCategoryForm] = Form.useForm();
  const [currentCategoryId, setCurrentCategoryId] = useState(-1);

  const [isListening, setIsListening] = useState(false);
  const [audio] = useState(typeof window === 'undefined' ? undefined : new Audio());

  const handleListen = () => {
    if (isListening) {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    } else {
      if (audio) {
        audio.src = api.scanner.getFileAsPath(trackQuery.data?.filehash || '');
        audio.play().catch(console.error);
      }
    }

    setIsListening(!isListening);
  };

  const handleCategoryEdit = (categoryId: number) => {
    setCurrentCategoryId(categoryId);
    const category = categoriesQuery.data?.find((_) => _.id === categoryId);

    editCategoryForm.setFieldValue('name', category?.name);
    editCategoryForm.setFieldValue('values', category?.items || []);
  };

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
        return categoriesQuery.refetch();
      });
  };

  const handleCreateNewGroup = () => {
    api.categories
      .create({
        name: 'New unnamed category',
        values: ['First value', 'Second value'],
      })
      .finally(() => categoriesQuery.refetch());
  };

  const handleCheckClassItem = (classItemId: number, isChecked: boolean) => {
    api.categories
      .updateTrackData(trackQuery?.data?.filehash || '', {
        filehash: trackQuery?.data?.filehash || '',
        classItemsIds: isChecked
          ? [...(trackQuery?.data?.classedItems || []).map((_) => _.classItemId), classItemId]
          : (trackQuery?.data?.classedItems || [])
              .map((_) => _.classItemId)
              .filter((_) => _ !== classItemId),
      })
      .catch(console.error)
      .finally(() => trackQuery.refetch());
  };

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

  return (
    <Space size='large' align='start'>
      <Space size='large' direction='vertical'>
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

        <Card title='Library explorer' style={{ width: 380 }}>
          <Tree
            showIcon
            checkedKeys={[]}
            treeData={tree}
            checkable={false}
            onCheck={console.log}
            onSelect={(item) => {
              const [selectedKey] = item;
              setSelectedTrackKey(selectedKey as string);
            }}
            showLine={{ showLeafIcon: true }}
            autoExpandParent
            height={450}
          />
        </Card>
      </Space>

      <Card
        title={classEditMode ? 'Editing class groups' : 'Classificator'}
        style={{ width: 'calc(100vw - 480px)' }}
        extra={
          classEditMode && (
            <Button type='primary' onClick={() => handleCreateNewGroup()}>
              Create new group
            </Button>
          )
        }
      >
        {!Boolean(selectedTrack) && !classEditMode && (
          <Typography.Text>
            Select track in <Typography.Text strong>Library explorer</Typography.Text>
          </Typography.Text>
        )}

        {Boolean(selectedTrack) && !classEditMode && (
          <Card size='small'>
            <Space direction='vertical' size='large'>
              <Space align='start'>
                <Image
                  src={api.scanner.getFileImageAsPath(trackQuery.data?.filehash || '')}
                  alt='track album'
                  width={128}
                  height={128}
                  style={{ borderRadius: 8 }}
                />

                <Button onClick={() => handleListen()}>{isListening ? 'Stop' : 'Listen'}</Button>
              </Space>

              <Space direction='vertical' size='small'>
                <Typography.Text>Artist: {trackQuery.data?.metadata?.artist}</Typography.Text>

                <Typography.Text>Title: {trackQuery.data?.metadata?.title}</Typography.Text>
              </Space>

              <Space direction='vertical' size='small'>
                {categoriesQuery.data?.map((category) => (
                  <Space key={category.id} align='baseline' wrap>
                    <Typography.Text style={{ display: 'inline-block', minWidth: '80px' }}>
                      {category.name}
                    </Typography.Text>

                    {category.items?.map((item) => {
                      const isChecked =
                        (trackQuery.data?.classedItems || []).find(
                          (aggregatedItem) => aggregatedItem.classItemId === item.id,
                        ) !== undefined;

                      console.log({ item });

                      return (
                        <Button
                          size='small'
                          key={item.id}
                          onClick={() => handleCheckClassItem(item.id, !isChecked)}
                          type={isChecked ? 'primary' : 'dashed'}
                        >
                          {item.value}
                        </Button>
                      );
                    })}
                  </Space>
                ))}
              </Space>
            </Space>
          </Card>
        )}

        {Boolean(classEditMode) && (
          <List
            dataSource={categoriesQuery.data}
            itemLayout='vertical'
            rowKey='id'
            renderItem={(item) => (
              <List.Item
                extra={
                  currentCategoryId === item.id
                    ? []
                    : [
                        <Button key='edit-btn' onClick={() => handleCategoryEdit(item.id)}>
                          Edit
                        </Button>,
                      ]
                }
              >
                <Space direction='vertical' size='large'>
                  <Typography.Text>{`#${item.id}: ${item.name}`}</Typography.Text>

                  {currentCategoryId === item.id && (
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
                  )}
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  );
};

ClassificatorPage.Layout = AdminLayout;
ClassificatorPage.Title = 'nesorter :: classificator';
export default ClassificatorPage;
export const getServerSideProps = withDefaultPageProps(async () => {
  const catalogs = await api.categories.get().then((_) => _.data);

  return {
    props: {
      catalogs,
    },
  };
});
