import { useEffect, useState } from "react";
import { api } from "../../../../api";
import { Chain, ManualPlaylistItem, UpdatePlaylistItemDto } from "../../../../api/types";
import { Box, Button, Pane, Text } from "../../../../components";
import { useFetch } from "../../../../hooks/useFetch";
import { Library } from "./Library";

type Props = {
  id: number;
}

export const PlaylistEditor = ({ id }: Props) => {
  const chainFetch = useFetch();
  const [chain, setChain] = useState<Chain>({});
  const chainValues = Object.values(chain);
  useEffect(() => {
    chainFetch.setFetching();

    api.scanner.getChain()
      .then(setChain)
      .catch(alert)
      .finally(chainFetch.setFetched);
  }, []);

  const { isFetching, setFetched, setFetching } = useFetch();
  const [tracks, setTracks] = useState<ManualPlaylistItem[]>([]);

  useEffect(() => {
    setFetching();

    api.playlistsManager.getPlaylist(id)
      .then(setTracks)
      .catch(alert)
      .finally(setFetched);
  }, [id]);

  const handleAdd = (filehash: string) => {
    const items: UpdatePlaylistItemDto = tracks.map(_ => ({ order: _.order, filehash: _.filehash }));
    items.push({ order: Date.now(), filehash });

    return api.playlistsManager.updatePlaylist(id, items).then(() => {
      return api.playlistsManager.getPlaylist(id)
        .then(setTracks)
        .catch(alert)
        .finally(setFetched);
    });
  }

  const handleDelete = (filehash: string) => {
    const items: UpdatePlaylistItemDto = tracks
      .map(_ => ({ order: _.order, filehash: _.filehash }))
      .filter(_ => _.filehash !== filehash);

    return api.playlistsManager.updatePlaylist(id, items).then(() => {
      return api.playlistsManager.getPlaylist(id)
        .then(setTracks)
        .catch(alert)
        .finally(setFetched);
    });
  }

  const library = (
    <Library onAdd={handleAdd} />
  );

  const added = (
    <Box padding="10px" flexDirection="column" gap={10} width="100%">
      {(isFetching || chainFetch.isFetching) && <Text color="textLight">Loading...</Text>}
      {!(isFetching || chainFetch.isFetching) && tracks.map((item) => {
        const file = chainValues.find(i => i.fsItem?.filehash === item.filehash);

        return (
          <Box key={item.filehash} alignItems="center" justifyContent="space-between" width="100%">
            <Box flexDirection="column" maxWidth="calc(100% - 96px)">
              <Text fontSize="desc" variant="oneline" color="textLight">
                {file?.fsItem?.id3Artist} - {file?.fsItem?.id3Title}
              </Text>

              <Text fontSize="sm" variant="oneline" color="#999">
                {file?.fsItem?.path}
              </Text>
            </Box>

            <Button onClick={() => handleDelete(item.filehash)} variant="secondary" size="small">✕</Button>
          </Box>
        );
      })}
    </Box>
  );

  const heading = (
    <Box borderBottom="1px solid #5C5C5C">
      <Box width="50%" padding="10px" borderRight="1px solid #5C5C5C">
        <Text fontSize="desc" color="textLight">Library</Text>
      </Box>

      <Box width="50%" padding="10px">
        <Text fontSize="desc" color="textLight">Added</Text>
      </Box>
    </Box>
  );

  const body = (
    <Box height="100%">
      <Box width="50%" borderRight="1px solid #5C5C5C">
        {library}
      </Box>

      <Box width="50%">
        {added}
      </Box>
    </Box>
  );

  return (
    <Pane>
      {heading}
      {body}
    </Pane>
  );
}
