import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { Chain } from "../../api/types";
import { Box, Button } from "../../components";
import { TrackTree } from "./components/TrackTree";

const ClassifyPage = () => {
  const [selectedTrack, setSelectedTrack] = useState('');
  const [chain, setChain] = useState<Chain>({});
  const selectedAsChainItem = useMemo(() => Object.values(chain).find(_ => _.key === selectedTrack), [chain, selectedTrack]);

  useEffect(() => {
    api.scanner.getChain()
      .then(setChain)
      .catch(console.log);
  }, []);

  return (
    <Box gap={14}>
      <Box width="100%" minWidth="292px" maxWidth="292px" flexDirection="column" gap={14}>
        <Button variant="secondary" size="normal">Open category editor</Button>
        <TrackTree chain={chain} selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack} />
      </Box>

      <Box width="100%">{selectedAsChainItem?.fsItem?.filehash}</Box>
    </Box>
  );
}

export default ClassifyPage;
