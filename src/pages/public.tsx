import { PropsWithChildren } from 'react';

import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const Page = () => {
  return <span>public page</span>;
};

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div>
      test layout
      <div>{children}</div>
    </div>
  );
};

Page.Layout = Layout;

export default Page;

export const getServerSideProps = withDefaultPageProps(() =>
  Promise.resolve({
    props: {
      adminSide: false,
    },
  }),
);
