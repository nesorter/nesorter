import { addSeconds, format, startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react"
import { api } from "../../../api";
import { Chain, Status } from "../../../api/types"
import { Box } from "../../../components";
import { StyledTd } from "./styles";

export const PlaylistBox = () => {
  const [chain, setChain] = useState<Chain>({});
  const chainValues = useMemo(() => Object.values(chain), [chain]);

  const [status, setStatus] = useState<Status>({
    playing: false,
    syncing: false,
    streaming: false,
    scheduling: false,
    currentFile: undefined,
    currentPlaylistId: undefined,
    queue: {
      currentOrder: null,
      items: [],
      state: 'stopped',
    }
  });

  useEffect(() => {
    api.scanner.getChain()
      .then(setChain)
      .catch(alert);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api.logger.getStatus().then(setStatus).catch(alert);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column" height="100%" overflowX="hidden">
      <table>
        <thead>
          <StyledTd className="order">order</StyledTd>
          <StyledTd className="state">state</StyledTd>
          <StyledTd className="name">name</StyledTd>
          <StyledTd className="start">start</StyledTd>
          <StyledTd className="end">end</StyledTd>
        </thead>

        <tbody>
          {status.queue.items.map((track) => {
            const current = status.queue.currentOrder === track.order;
            const chainItem = chainValues.find(_ => _.fsItem?.filehash === track.fileHash);
            const trackName = chainItem ? `${chainItem.fsItem?.metadata?.artist} - ${chainItem.fsItem?.metadata?.title}` : track.fileHash;

            return (
              <tr key={track.fileHash}>
                <StyledTd className="order">{track.order}</StyledTd>
                <StyledTd className="state">{current && '>'}</StyledTd>
                <StyledTd className="name">{trackName}</StyledTd>
                <StyledTd className="start">{format(addSeconds(startOfDay(new Date()), track.startAt), 'HH:mm:ss')}</StyledTd>
                <StyledTd className="end">{format(addSeconds(startOfDay(new Date()), track.endAt), 'HH:mm:ss')}</StyledTd>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
}
