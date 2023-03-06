import { CSSProperties } from 'react';
import styled from 'styled-components';

import theme from '@/client/theme';

interface Props {
  display?: CSSProperties['display'];

  flexDirection?: CSSProperties['flexDirection'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  flexGrow?: CSSProperties['flexGrow'];
  flexWrap?: CSSProperties['flexWrap'];

  gap?: CSSProperties['gap'];
  padding?: CSSProperties['padding'];
  margin?: CSSProperties['margin'];

  width?: CSSProperties['width'];
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];

  height?: CSSProperties['height'];
  minHeight?: CSSProperties['minHeight'];
  maxHeight?: CSSProperties['maxHeight'];

  backgroundColor?: CSSProperties['backgroundColor'];
  border?: CSSProperties['border'];
  borderRadius?: CSSProperties['borderRadius'];

  overflowY?: CSSProperties['overflowY'];
  overflowX?: CSSProperties['overflowX'];

  borderBottom?: CSSProperties['borderBottom'];
  borderRight?: CSSProperties['borderRight'];

  paddingLeft?: CSSProperties['paddingLeft'];
}

export const Box = styled.div<Props>`
  display: ${(props) => props.display || 'flex'};

  flex-direction: ${(props) => props.flexDirection};
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  flex-grow: ${(props) => props.flexGrow};
  flex-wrap: ${(props) => props.flexWrap};

  gap: ${(props) => props.gap};
  padding: ${(props) => props.padding};
  margin: ${(props) => props.margin};

  width: ${(props) => props.width};
  min-width: ${(props) => props.minWidth};
  max-width: ${(props) => props.maxWidth};

  height: ${(props) => props.height};
  min-height: ${(props) => props.minHeight};
  max-height: ${(props) => props.maxHeight};

  background-color: ${(props) =>
    theme.colors[props.backgroundColor as keyof typeof theme.colors] || undefined};
  border: ${(props) => props.border};
  border-radius: ${(props) => props.borderRadius};

  overflow-y: ${(props) => props.overflowY};
  overflow-x: ${(props) => props.overflowX};

  border-bottom: ${(props) => props.borderBottom};
  border-right: ${(props) => props.borderRight};

  padding-left: ${(props) => props.paddingLeft};
`;