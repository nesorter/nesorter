import { Box } from "../../../components";

export const Waveform = ({ data }: { data: number[]; }): JSX.Element => {
  const height = 240;
  const width = 640;

  const dUpper = data.reduce((acc, value, index) => {
    const perc = 100 / (data.length / index);
    return acc + ` L${(width / 100) * perc}, ${(height) - value * 150}`;
  }, `M0 ${height + 1}`);

  const dLower = data.reduce((acc, value, index) => {
    const perc = 100 / (data.length / index);
    return acc + ` L${(width / 100) * perc}, ${(height) + value * 150}`;
  }, `M0 ${height - 1}`);

  return (
    <Box style={{ maxHeight: '240px' }}>
      <svg viewBox={`0 0 ${width} ${width}`} width="100%" preserveAspectRatio="none">
        <path d={`${dUpper} L${width} ${height + 1}`} stroke="green" strokeWidth={0.5} fill="#96CE4E"/>
        <path d={`${dLower} L${width} ${height - 1}`} stroke="green" strokeWidth={0.5} fill="#96CE4E"/>
      </svg>
    </Box>
  );
}