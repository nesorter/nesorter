import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { Chain } from "../../api/types";
import { Box, Button } from "../../components";
import { useModal } from "../../hooks/useModal";
import { CatsEditModal } from "./components/CatsEditModal";
import { Track } from "./components/Track";
import { TrackTree } from "./components/TrackTree";

const ClassifyPage = () => {
  const [chain, setChain] = useState<Chain>({});
  const [selectedTrack, setSelectedTrack] = useState('');

  const selectedAsChainItem = useMemo(() => Object.values(chain).find(_ => _.key === selectedTrack), [chain, selectedTrack]);
  const selectedIndex = useMemo(() => Object.values(chain).findIndex(_ => _.key === selectedTrack), [chain, selectedTrack]);

  const editCatsModalState = useModal(false);

  useEffect(() => {
    api.scanner.getChain()
      .then(setChain)
      .catch(console.log);
  }, []);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedIndex) {
      return;
    }

    const next = Object.values(chain).at(selectedIndex + (direction === 'prev' ? -1 : 1));
    setSelectedTrack(next?.key || '');
  }

  return (
    <Box gap={14} width="100%">
      <Box width="100%" minWidth="292px" maxWidth="292px" flexDirection="column" gap={14}>
        <Button variant="secondary" size="normal" onClick={() => editCatsModalState.setOpen(true)}>Open category editor</Button>
        <TrackTree chain={chain} selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack} />
      </Box>

      <Box width="100%">{selectedAsChainItem ? <Track track={selectedAsChainItem} onNavigate={handleNavigate} /> : null}</Box>

      <CatsEditModal editCatsModalState={editCatsModalState} />
    </Box>
  );
}

export default ClassifyPage;
