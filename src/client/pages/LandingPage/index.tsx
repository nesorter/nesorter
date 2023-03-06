import { PublicLayout } from '@/client/layouts/PublicLayout';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const LandingPage = () => {
  return <span>there should be radio player later</span>;
};

LandingPage.Layout = PublicLayout;
export default LandingPage;
export const getServerSideProps = withDefaultPageProps(() =>
  Promise.resolve({
    props: {
      adminSide: false,
    },
  }),
);
