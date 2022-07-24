import { useState } from "react";
import { Box, Button, Text } from "../../../components";
import { useDebounce } from "../../../hooks/useDebounce";
import { UseTrimmerStateReturn } from "../../../hooks/useTrimmerState";

type Props = {
  state: UseTrimmerStateReturn;
  onSave: () => void;
};

export const Trimmer = ({ state, onSave }: Props) => {
  const [dragModeStart, setDragModeStart] = useState(false);
  const [dragModeEnd, setDragModeEnd] = useState(false);
  const { start, end, duration } = state.state;
  const [startPerc, endPerc] = [
    start / (duration / 100),
    (duration - end) / (duration / 100),
  ];

  const thumbGenerator = (
    left: string | undefined, 
    right: string | undefined,
    onSetDragMode: (_: boolean) => void,
  ) => {
    return (
      <Box
        backgroundColor="white"
        width="24px"
        height="48px"
        style={{ position: 'absolute', top: '2px', left, right }}
        onMouseDown={() => onSetDragMode(true)}
        onMouseUp={() => onSetDragMode(false)}
      />
    );
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = useDebounce(15, (_) => {
    if (!dragModeStart && !dragModeEnd) {
      return;
    }

    try {
      const modifier = dragModeStart ? -12 : 12;
      const allWidth = document.getElementById('thumbRoot')?.getBoundingClientRect().width;
      // @ts-ignore
      const newOffset = ((_.nativeEvent.clientX - document.getElementById('thumbRoot')?.getBoundingClientRect().left) + modifier) / (allWidth / 100);

      if (dragModeStart) {
        state.setState(prev => ({ ...prev, start: Math.round(((duration / 100) * newOffset) * 100) / 100 }));
      }
  
      if (dragModeEnd) {
        state.setState(prev => ({ ...prev, end: Math.round(((duration / 100) * newOffset) * 100) / 100 }));
      }

    } catch (e) {
      console.log(e)
    }
  });

  return (
    <Box width="100%" flexDirection="column" id="thumbRoot">
      <Box width="100%" height="64px" backgroundColor="#96CE4E" justifyContent="space-between">
        <Box width={`${startPerc}%`} height="64px" backgroundColor="red"></Box>
        <Box width={`${endPerc}%`} height="64px" backgroundColor="red"></Box>
      </Box>

      <Box height="64px" width="100%" style={{ position: 'relative' }} onMouseMove={handleMouseMove}>
        {thumbGenerator(`${startPerc}%`, undefined, setDragModeStart)}
        {thumbGenerator(undefined, `${endPerc}%`, setDragModeEnd)}
      </Box>

      <Box flexDirection="column">
        <Text color="white">duration: {duration}s</Text>
        <Text color="white">start: {start}s</Text>
        <Text color="white">end: {end}s</Text>
      </Box>

      <Box paddingTop="8px">
        <Button variant="primary" size="normal" onClick={onSave}>Save</Button>
      </Box>
    </Box>
  );
}