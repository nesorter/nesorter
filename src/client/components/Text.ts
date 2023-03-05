import styled from 'styled-components';
import {
  color,
  ColorProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
  typography,
  TypographyProps,
  variant,
} from 'styled-system';

interface TextProps extends LayoutProps, TypographyProps, SpaceProps, ColorProps {
  children: React.ReactNode;
  variant?: 'oneline';
}

export const Text = styled.span<TextProps>`
  ${typography}
  ${space}
  ${color}
  ${layout}
  ${variant({
    variants: {
      oneline: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      },
    },
  })}
`;
