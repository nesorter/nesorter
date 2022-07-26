import { useEffect, useState } from "react"
import { api } from "../../../api";
import { Chain, ManualPlaylistItem, Status } from "../../../api/types"
import { Box, Text } from "../../../components";

export const PlaylistBox = () => {
  const [chain, setChain] = useState<Chain>({});
  const chainValues = Object.values(chain);
  const [tracks, setTracks] = useState<ManualPlaylistItem[]>([]);

  const [status, setStatus] = useState<Status>({
    playing: false,
    syncing: false,
    streaming: false,
    currentFile: undefined,
    currentPlaylistId: undefined,
  });

  useEffect(() => {
    api.scanner.getChain()
      .then(setChain)
      .catch(alert);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api.logger.getStatus().then(setStatus).catch(alert);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status.currentPlaylistId === undefined) {
      setTracks([]);
      return;
    }

    api.playlistsManager.getPlaylist(status.currentPlaylistId)
      .then(setTracks)
      .catch(alert);
  }, [status.currentPlaylistId]);

  return (
    <Box flexDirection="column" height="100%" overflowX="hidden" maxWidth="480px">
      {tracks.map((track) => {
        const current = track.filehash === status.currentFile;
        const chainItem = chainValues.find(_ => _.fsItem?.filehash === track.filehash);
        const trackName = chainItem ? `${chainItem.fsItem?.id3Artist} - ${chainItem.fsItem?.id3Title}` : track.filehash;

        return (
          <Text variant="oneline" key={track.filehash} color="textLight" padding={current ? '10px 0' : ''}>{current ? '->>' : ''} {trackName}</Text>
        );
      })}
    </Box>
  );
}