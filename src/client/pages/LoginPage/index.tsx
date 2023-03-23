import { Button, Card, Form, Input } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { LoginLayout } from '@/client/layouts/LoginLayout';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const LoginPage = () => {
  const router = useRouter();

  const onFinish = (values: { 'nesorter-admin-token': string }) => {
    localStorage.setItem('nesorter-admin-token', values['nesorter-admin-token']);
    document.cookie = `nesorter-admin-token=${values['nesorter-admin-token']}; path=/; max-age=${
      60 * 60 * 24 * 14
    };`;

    router
      .replace('/admin/status')
      .then(() => router.reload())
      .catch(console.error);
  };

  return (
    <Card title='Login' style={{ width: 480 }}>
      <Form
        name='login-form'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ 'nesorter-admin-token': '' }}
        onFinish={onFinish}
        onFinishFailed={console.error}
        autoComplete='on'
      >
        <Form.Item
          label='Admin token'
          name='nesorter-admin-token'
          rules={[{ required: true, message: 'This field required' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

LoginPage.Layout = LoginLayout;
LoginPage.Title = 'nesorter :: login';
export default LoginPage;
export const getServerSideProps = withDefaultPageProps(() =>
  Promise.resolve({ props: { adminSide: false } }),
);
