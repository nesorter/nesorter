import styled from 'styled-components';

import { Box } from '../../components';
import { BASE_HEIGHT } from './constants';

export const StyledCell = styled(Box)`
  position: relative;
  height: ${BASE_HEIGHT}px;
  width: 64px;

  align-items: center;
  justify-content: center;

  background-color: white;
  border-top: 1px solid gray;

  &:hover {
    background-color: aliceblue;
  }
`;

export const StyledLine = styled.div`
  position: absolute;
  border-top: 1px rgba(255, 255, 255, 0.2) dashed;
  top: 0%;
  left: 0%;
  width: 100%;
`;
