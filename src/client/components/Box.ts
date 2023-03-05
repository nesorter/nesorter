import React from 'react';
import styled from 'styled-components';
import {
  borders,
  BordersProps,
  color,
  ColorProps,
  flexbox,
  FlexboxProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
} from 'styled-system';

import theme from '../theme';

interface BoxProps extends BordersProps, FlexboxProps, LayoutProps, SpaceProps, ColorProps {
  children?: React.ReactNode | React.ReactNode[];
  gap?: string | number;
}

export const Box = styled.div<BoxProps>`
  display: flex;
  ${borders}
  ${layout}
  ${flexbox}
  ${space}
  ${color}
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : `${gap ? theme.space[gap] : 0}px`)};
`;
