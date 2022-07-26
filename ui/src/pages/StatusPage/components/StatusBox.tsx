import { useEffect, useState } from "react"
import { api } from "../../../api";
import { Status } from "../../../api/types"
import { Box, Text } from "../../../components";

export const StatusBox = () => {
  const [status, setStatus] = useState<Status>({
    playing: false,
    syncing: false,
    streaming: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      api.logger.getStatus().then(setStatus).catch(alert);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column">
      <Text color="textLight">Playing: {status.playing ? '✓' : '✕'}</Text>
      <Text color="textLight">Sync: {status.syncing ? '✓' : '✕'}</Text>
      <Text color="textLight">Streaming: {status.streaming ? '✓' : '✕'}</Text>
    </Box>
  );
}