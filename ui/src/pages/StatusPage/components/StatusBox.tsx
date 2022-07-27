import { useEffect, useState } from "react"
import { api } from "../../../api";
import { Status } from "../../../api/types"
import { Box, Text } from "../../../components";

export const StatusBox = () => {
  const [status, setStatus] = useState<Status>({
    scheduling: false,
    playing: false,
    syncing: false,
    streaming: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      api.logger.getStatus().then(setStatus).catch(alert);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column">
      <Text color="textLight">Playing: {status.playing ? '✓' : '✕'}</Text>
      <Text color="textLight">Sync: {status.syncing ? '✓' : '✕'}</Text>
      <Text color="textLight">Streaming: {status.streaming ? '✓' : '✕'}</Text>
      <Text color="textLight">Scheduling: {status.scheduling ? '✓' : '✕'}</Text>
    </Box>
  );
}
