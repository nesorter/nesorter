import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import theme from '@/client/theme';

type TextProps = PropsWithChildren<{
  variant?: 'oneline';
  fontSize?: 'sm' | 'desc' | 'body' | 'heading' | string;
  fontWeight?: string;
  minWidth?: string;
}>;

const fontSizeMap = {
  sm: theme.fontSizes[0],
  desc: theme.fontSizes[1],
  body: theme.fontSizes[2],
  heading: theme.fontSizes[3],
};

export const Text = styled.span<TextProps>`
  min-width: ${(props) => props.minWidth};
  text-overflow: ${(props) => (props.variant === 'oneline' ? 'ellipsis' : undefined)};
  overflow: ${(props) => (props.variant === 'oneline' ? 'hidden' : undefined)};
  white-space: ${(props) => (props.variant === 'oneline' ? 'nowrap' : undefined)};
  font-weight: ${(props) => props.fontWeight};
  font-size: ${(props) =>
    fontSizeMap[props.fontSize as keyof typeof fontSizeMap] || props.fontSize};
`;
