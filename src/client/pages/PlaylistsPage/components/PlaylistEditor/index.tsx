import { useEffect, useState } from 'react';

import { api } from '../../../../api';
import { Chain, DtoUpdatePlaylistItem, ManualPlaylistItem } from '../../../../api/types';
import { Box, Button, Pane, Text } from '../../../../components';
import { useFetch } from '../../../../hooks/useFetch';
import { Library } from './Library';

type Props = {
  id: number;
};

export const PlaylistEditor = ({ id }: Props) => {
  const chainFetch = useFetch();
  const [chain, setChain] = useState<Chain>({});
  const chainValues = Object.values(chain);
  useEffect(() => {
    chainFetch.setFetching();

    api.scanner.getChain().then(setChain).catch(alert).finally(chainFetch.setFetched);
  }, [id]);

  const { isFetching, setFetched, setFetching } = useFetch();
  const [tracks, setTracks] = useState<ManualPlaylistItem[]>([]);

  useEffect(() => {
    setFetching();

    api.playlistsManager.getPlaylist(id).then(setTracks).catch(alert).finally(setFetched);
  }, [id]);

  const handleAdd = (filehash: string) => {
    const items: DtoUpdatePlaylistItem = tracks.map((_) => ({
      order: _.order,
      filehash: _.fileItemHash,
    }));
    items.push({ order: Date.now(), filehash });

    return api.playlistsManager.updatePlaylist(id, items).then(() => {
      return api.playlistsManager.getPlaylist(id).then(setTracks).catch(alert).finally(setFetched);
    });
  };

  const handleDelete = (filehash: string) => {
    const items: DtoUpdatePlaylistItem = tracks
      .map((_) => ({ order: _.order, filehash: _.fileItemHash }))
      .filter((_) => _.filehash !== filehash);

    return api.playlistsManager.updatePlaylist(id, items).then(() => {
      return api.playlistsManager.getPlaylist(id).then(setTracks).catch(alert).finally(setFetched);
    });
  };

  const handlePlay = () => {
    api.player.playPlaylist(id);
  };

  const handleAddAll = async (hashes: string[]) => {
    const items: DtoUpdatePlaylistItem = hashes.map((_, index) => ({ order: index, filehash: _ }));

    return api.playlistsManager.updatePlaylist(id, items).then(() => {
      return api.playlistsManager.getPlaylist(id).then(setTracks).catch(alert).finally(setFetched);
    });
  };

  const library = <Library onAdd={handleAdd} onAddAll={handleAddAll} />;

  const added = (
    <Box padding='10px' flexDirection='column' gap={10} width='100%'>
      {(isFetching || chainFetch.isFetching) && <Text color='textLight'>Loading...</Text>}

      {!(isFetching || chainFetch.isFetching) &&
        tracks.map((item) => {
          const file = chainValues.find((i) => i.fsItem?.filehash === item.fileItemHash);

          return (
            <Box
              key={item.fileItemHash}
              alignItems='center'
              justifyContent='space-between'
              width='100%'
            >
              <Box flexDirection='column' maxWidth='calc(100% - 96px)'>
                <Text fontSize='desc' variant='oneline' color='textLight'>
                  {file?.fsItem?.metadata?.artist} - {file?.fsItem?.metadata?.title}
                </Text>

                <Text fontSize='sm' variant='oneline' color='#999'>
                  {file?.fsItem?.path}
                </Text>
              </Box>

              <Button
                onClick={() => handleDelete(item.fileItemHash)}
                variant='secondary'
                size='small'
              >
                ✕
              </Button>
            </Box>
          );
        })}
    </Box>
  );

  const heading = (
    <Box borderBottom='1px solid #5C5C5C'>
      <Box
        width='100%'
        maxWidth='50%'
        padding='10px'
        borderRight='1px solid #5C5C5C'
        alignItems='center'
      >
        <Text fontSize='desc' color='textLight'>
          Library
        </Text>
      </Box>

      <Box
        width='100%'
        maxWidth='50%'
        padding='10px'
        justifyContent='space-between'
        alignItems='center'
      >
        <Text fontSize='desc' color='textLight'>
          Added
        </Text>

        <Button variant='primary' size='small' onClick={handlePlay}>
          Play this
        </Button>
      </Box>
    </Box>
  );

  const body = (
    <Box height='100%'>
      <Box width='50%' borderRight='1px solid #5C5C5C'>
        {library}
      </Box>

      <Box width='50%'>{added}</Box>
    </Box>
  );

  return (
    <Pane>
      {heading}

      {body}
    </Pane>
  );
};
