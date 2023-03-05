import Link from 'next/link';

import { Box } from './Box';
import { Text } from './Text';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box padding='lg' gap='lg' backgroundColor='dark100' flexDirection='column' minHeight='100vh'>
      <Box gap='lg'>
        {[
          { to: '/', title: 'Status' },
          { to: '/classify', title: 'Classify' },
          { to: '/playlists', title: 'Playlists' },
          { to: '/scheduler', title: 'Scheduler' },
          { to: '/upload', title: 'Upload' },
        ].map((item) => (
          <Link key={item.to} href={item.to}>
            <Text color='textLight'>{item.title}</Text>
          </Link>
        ))}
      </Box>

      <Box height='100%' maxHeight='calc(100% - 42px)'>
        {children}
      </Box>
    </Box>
  );
};
