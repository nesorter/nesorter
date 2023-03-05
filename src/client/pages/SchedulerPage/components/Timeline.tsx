import { addHours, format, startOfDay } from 'date-fns';

import { Box, Text } from '../../../components';
import { StyledCell } from '../styles';

export const Timeline = () => {
  const times: string[] = [];
  for (let i = 0; i <= 23; i++) {
    if (i === 24) {
      times.push('24:00');
    } else {
      times.push(format(addHours(startOfDay(new Date()), i), 'HH:mm'));
    }
  }

  return (
    <Box flexDirection='column'>
      {times.map((item) => (
        <StyledCell key={item}>
          <Text>{item}</Text>
        </StyledCell>
      ))}
    </Box>
  );
};
