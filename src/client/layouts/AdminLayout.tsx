import { JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';

import { Layout } from '@/client/types/Layout';

import { Box } from '../components/Box';
import { Text } from '../components/Text';

const font = JetBrains_Mono({
  weight: ['400', '600'],
  subsets: ['cyrillic'],
  display: 'auto',
  variable: '--font-name',
});

export const AdminLayout: Layout = ({ children }) => {
  return (
    <Box
      className={font.className}
      padding='lg'
      gap='lg'
      backgroundColor='dark100'
      flexDirection='column'
      minHeight='100vh'
    >
      <Box gap='lg'>
        {[
          { to: '/admin/status', title: 'Status' },
          { to: '/admin/classify', title: 'Classify' },
          { to: '/admin/playlists', title: 'Playlists' },
          { to: '/admin/scheduler', title: 'Scheduler' },
          { to: '/admin/upload', title: 'Upload' },
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
