import { AdminLayout } from '@/client/layouts/AdminLayout';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const SequencerPage = () => {
  return <div>test</div>;
};

SequencerPage.Layout = AdminLayout;
SequencerPage.Title = 'nesorter :: sequencer';
export default SequencerPage;
export const getServerSideProps = withDefaultPageProps();
