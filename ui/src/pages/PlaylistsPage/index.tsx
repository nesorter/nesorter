import { useEffect, useState } from "react";
import { api } from "../../api";
import { Playlist } from "../../api/types";
import { Box, Button, Pane, PaneItem, Text } from "../../components";
import { Icon } from "../../components/Icon";
import { useFetch } from "../../hooks/useFetch";
import { useModal } from "../../hooks/useModal";
import { CreatePlaylistModal } from "./components/CreatePlaylistModal";
import { PlaylistEditor } from "./components/PlaylistEditor";

const PlaylistsPage = () => {
  const createPlModalState = useModal();
  const { isFetching, setFetched, setFetching } = useFetch();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<number | undefined>();

  useEffect(() => {
    setFetching();

    api.playlistsManager.getPlaylists()
      .then(setPlaylists)
      .catch(alert)
      .finally(setFetched);
  }, []);

  if (isFetching) {
    return <Text color="textLight">Loading...</Text>;
  }

  let content = <span />;
  if (selected) {
    content = <PlaylistEditor id={selected} />
  }

  return (
    <Box gap={14} width="100%" maxWidth="100%">
      <Box width="100%" minWidth="292px" maxWidth="292px" flexDirection="column" gap={14}>
        <Button size="normal" variant="secondary" onClick={() => createPlModalState.setOpen(true)}>Create playlist</Button>

        <Pane>
          {playlists.map(_ => (
            <PaneItem key={_.id} isSelected={selected === _.id} step={1} onSelect={() => setSelected(_.id)}>
              <Box gap={7} alignItems="center" width="100%">
                <Icon name="dir" color="#999" size={14} />
                <Text color="textLight" fontSize="sm" variant="oneline">{_.name} #{_.id}</Text>
              </Box>
            </PaneItem>
          ))}
        </Pane>
      </Box>

      <Box width="100%">
        {content}
      </Box>

      <CreatePlaylistModal
        state={createPlModalState}
        onCreate={() => {
          setFetching();

          api.playlistsManager.getPlaylists()
            .then(setPlaylists)
            .catch(alert)
            .finally(setFetched);
        }}
      />
    </Box>
  );
}

export default PlaylistsPage;
