import { PropsWithChildren } from 'react';

import { UseModalReturn } from '../hooks/useModal';
import { Box } from './Box';

type Props = PropsWithChildren<{
  state: UseModalReturn;
}>;

export const Modal = ({ state, children }: Props): JSX.Element | null => {
  if (!state.open) {
    return null;
  }

  return (
    <Box
      justifyContent='center'
      alignItems='center'
      style={{
        position: 'absolute',
        zIndex: 998,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Box
        onClick={() => state.setOpen(!state.open)}
        style={{
          position: 'absolute',
          zIndex: 997,
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      <Box
        borderRadius='4px'
        padding='14px'
        backgroundColor='dark200'
        width='calc(80% - 48px)'
        height='100%'
        maxHeight='calc(100% - 96px)'
        style={{ zIndex: 999 }}
        overflowY='auto'
      >
        {children}
      </Box>
    </Box>
  );
};
