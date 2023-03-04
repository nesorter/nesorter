import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { Chain, ClassificationCategory } from '../../api/types';
import { Box, Button } from "../../components";
import { useModal } from "../../hooks/useModal";
import { CatsEditModal } from "./components/CatsEditModal";
import { Track } from "./components/Track";
import { TrackEditModal } from "./components/TrackEditModal";
import { TrackTree } from "./components/TrackTree";

const ClassifyPage = () => {
  const [chain, setChain] = useState<Chain>({});
  const [selectedTrack, setSelectedTrack] = useState('');

  const selectedAsChainItem = useMemo(() => Object.values(chain).find(_ => _.key === selectedTrack), [chain, selectedTrack]);

  const editCatsModalState = useModal(false);
  const editTrackModal = useModal(false);

  useEffect(() => {
    // api.scanner.getChain()
    //   .then(setChain)
    //   .catch(console.log);
  }, []);

  const handleApplyAll = async (fileHash: string, categories: ClassificationCategory[]) => {
    const plain = Object.values(chain);
    const item = plain.find(_ => _.fsItem?.filehash === fileHash);

    if (!item) {
      return;
    }

    const siblings = plain.filter(_ => _.parent === item.parent);

    if (!siblings) {
      return;
    }

    for (let sibling of siblings) {
      await api.classificator.setCategories(sibling.fsItem?.filehash || '', categories);
    }
  }

  return (
    <Box>
      <span style={{ color: '#fff' }}><b>Сейчас выпилено :3</b></span>
    </Box>
  )

  // return (
  //   <Box gap={14} width="100%">
  //     <Box width="100%" minWidth="292px" maxWidth="292px" flexDirection="column" gap={14}>
  //       <Button variant="secondary" size="normal" onClick={() => editCatsModalState.setOpen(true)}>Open category editor</Button>
  //       <TrackTree chain={chain} selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack} />
  //     </Box>
  //
  //     <Box width="100%">{selectedAsChainItem ? <Track track={selectedAsChainItem} onHandleApplyAll={handleApplyAll} onTrackEdit={() => editTrackModal.setOpen(true)} /> : null}</Box>
  //
  //     <CatsEditModal modalState={editCatsModalState} />
  //     <TrackEditModal modalState={editTrackModal} trackHash={selectedAsChainItem?.fsItem?.filehash || ''} />
  //   </Box>
  // );
}

export default ClassifyPage;
