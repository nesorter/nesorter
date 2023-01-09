import { api } from "../../../api";
import { Box, Button } from "../../../components"

export const ActionBox = () => {
  const handleStopStream = () => {
    api.streamer.stopStream();
  }

  const handleStartStream = () => {
    api.streamer.startStream();
  }

  const handleStartSync = () => {
    api.scanner.startSync();
  }

  const handleStopScheduling = () => {
    api.scheduler.stop();
  }

  const handleStartScheduling = () => {
    api.scheduler.start();
  }

  const handleStartQueue = () => {
    api.player.play();
  }

  const handleStopQueue = () => {
    api.player.stop();
  }

  return (
    <Box flexDirection="column" gap={7} width={256}>
      <Button variant="secondary" size="small" onClick={()=> alert('missed implementation')}>Play all playlists (randomly)</Button>
      <Button variant="secondary" size="small" onClick={handleStartStream}>Start stream</Button>
      <Button variant="secondary" size="small" onClick={handleStopStream}>Stop stream</Button>
      <Button variant="secondary" size="small" onClick={()=> alert('missed implementation')}>Stop playing</Button>
      <Button variant="secondary" size="small" onClick={handleStartSync}>Start sync</Button>
      <Button variant="secondary" size="small" onClick={handleStartScheduling}>Start scheduling</Button>
      <Button variant="secondary" size="small" onClick={handleStopScheduling}>Stop scheduling</Button>
      <Button variant="secondary" size="small" onClick={handleStartQueue}>Start Queue</Button>
      <Button variant="secondary" size="small" onClick={handleStopQueue}>Stop Queue</Button>
    </Box>
  );
}
