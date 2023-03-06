import { api } from '../../../api';
import { Box, Button } from '../../../components';

export const ActionBox = () => {
  const handleRestart = () => {
    api.logger.restart().catch(alert);
  };

  const handleStopStream = () => {
    api.streamer.stopStream().catch(alert);
  };

  const handleStartStream = () => {
    api.streamer.startStream().catch(alert);
  };

  const handleStartSync = () => {
    api.scanner.startSync().catch(alert);
  };

  const handleStopScheduling = () => {
    api.scheduler.stop().catch(alert);
  };

  const handleStartScheduling = () => {
    api.scheduler.start().catch(alert);
  };

  const handleStartQueue = () => {
    api.player.play().catch(alert);
  };

  const handleStopQueue = () => {
    api.player.stop().catch(alert);
  };

  const handleClearQueue = () => {
    api.player.clear().catch(alert);
  };

  const handlePlayRandom = () => {
    api.player.playRandom().catch(alert);
  };

  return (
    <Box flexDirection='column' gap={7} width={256}>
      <Button variant='secondary' size='small' onClick={handleRestart}>
        Halt server (restart)
      </Button>

      <Button variant='secondary' size='small' onClick={handleStartSync}>
        Start sync
      </Button>

      <br />

      <Button variant='secondary' size='small' onClick={handlePlayRandom}>
        Play all playlists (randomly)
      </Button>

      <br />

      <Button variant='secondary' size='small' onClick={handleStartStream}>
        Start stream
      </Button>

      <Button variant='secondary' size='small' onClick={handleStopStream}>
        Stop stream
      </Button>

      <br />

      <Button variant='secondary' size='small' onClick={handleStartScheduling}>
        Start scheduling
      </Button>

      <Button variant='secondary' size='small' onClick={handleStopScheduling}>
        Stop scheduling
      </Button>

      <br />

      <Button variant='secondary' size='small' onClick={handleStartQueue}>
        Start Queue
      </Button>

      <Button variant='secondary' size='small' onClick={handleStopQueue}>
        Stop Queue
      </Button>

      <Button variant='secondary' size='small' onClick={handleClearQueue}>
        Clear Queue
      </Button>
    </Box>
  );
};