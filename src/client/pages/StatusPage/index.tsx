import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

import { Box, Text } from '../../components';
import { ActionBox } from './components/ActionBox';
import { PlaylistBox } from './components/PlaylistBox';
import { StatusBox } from './components/StatusBox';

const StatusPage = () => {
  return (
    <Box gap={28} flexDirection='column'>
      <Box gap={7} flexDirection='column'>
        <Text color='textLight' fontSize='body' fontWeight='bold'>
          System status:
        </Text>

        <Box gap={14} paddingLeft='14px'>
          <ActionBox />

          <StatusBox />
        </Box>
      </Box>

      <Box gap={7} flexDirection='column'>
        <Text color='textLight' fontSize='body' fontWeight='bold'>
          Queue:
        </Text>

        <Box paddingLeft='14px'>
          <PlaylistBox />
        </Box>
      </Box>
    </Box>
  );
};

export default StatusPage;
export const getServerSideProps = withDefaultPageProps(() => Promise.resolve({ props: {} }));
