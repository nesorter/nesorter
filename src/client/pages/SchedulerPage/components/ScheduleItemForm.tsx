import { useStore } from '@nanostores/react';
import { Button, Form, FormInstance, Input, Select, Switch } from 'antd';

import { handleSave, StoreSchedulerPage } from '@/client/pages/SchedulerPage/store';
import type { AggregatedScheduleItem } from '@/radio-service/types';

export const ScheduleItemForm = ({
  item,
  form,
}: {
  item: AggregatedScheduleItem;
  form: FormInstance;
}) => {
  const { playlists } = useStore(StoreSchedulerPage);

  return (
    <Form
      form={form}
      name='login-form'
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 19 }}
      style={{ maxWidth: 600 }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onFinish={(data) => handleSave(data, form)}
      onFinishFailed={console.error}
      autoComplete='off'
    >
      <Form.Item
        label='Name'
        name='name'
        rules={[{ required: true, message: 'This field required' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label='Playlists'
        name='playlists'
        rules={[{ required: true, message: 'This field required' }]}
      >
        <Select
          mode='multiple'
          options={playlists.map((pl) => ({
            value: pl.id,
            label: pl.name,
          }))}
        />
      </Form.Item>

      <Form.Item
        label='Merging'
        name='merging'
        tooltip='Allows the scheduler to virtually merge all selected playlists into one'
      >
        <Switch defaultChecked={item.withMerging > 0} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
        <Button type='primary' htmlType='submit'>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};
