import { Box } from './Box';

type Props = {
  isSelected: boolean;
  onSelect: () => void;
  step: number;
  children: React.ReactNode;
};

export const PaneItem = ({ isSelected, onSelect, step, children }: Props) => {
  return (
    <Box
      padding='7px'
      borderBottom='1px solid #777'
      backgroundColor={isSelected ? '#60834B' : 'transparent'}
      width='100%'
      style={{ cursor: 'pointer' }}
      onClick={onSelect}
    >
      <Box width='100%' paddingLeft={`${step * 7}px`} gap={7} flexDirection='column'>
        {children}
      </Box>
    </Box>
  );
};
