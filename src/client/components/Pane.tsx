import styled from 'styled-components';

import theme from '@/client/theme';

import { Box } from './Box';

export const Pane = styled(Box)((_props) => ({
  backgroundColor: theme.colors.dark200,
  borderRadius: '4px',
  width: '100%',
  height: '100%',
  maxHeight: 'calc(100vh - 130px)',
  flexDirection: 'column',
  overflowY: 'auto',
  overflowX: 'hidden',
}));
