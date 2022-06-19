import styled from 'styled-components'
import { flexbox, layout, space, color, FlexboxProps, LayoutProps, SpaceProps, ColorProps } from 'styled-system'
import theme from '../theme';

interface BoxProps extends FlexboxProps, LayoutProps, SpaceProps, ColorProps {
  children?: React.ReactNode;
  gap?: string | number;
}

export const Box = styled.div<BoxProps>`
  display: flex;
  ${layout}
  ${flexbox}
  ${space}
  ${color}
  gap: ${({ gap }) => typeof gap === 'number' ? `${gap}px` : `${gap ? theme.space[gap] : 0}px`};
`;
