import { Spin } from 'antd';

export const FetchingBox = () => {
  return (
    <Spin tip='Loading' size='large'>
      <div
        className='content'
        style={{
          padding: '50px',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        }}
      />
    </Spin>
  );
};
