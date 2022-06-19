import styled from 'styled-components'
import { variant, layout, typography, space, color, LayoutProps, TypographyProps, SpaceProps, ColorProps } from 'styled-system'

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
    }
  })}
`;
