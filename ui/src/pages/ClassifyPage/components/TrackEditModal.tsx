import React, { useEffect, useState } from "react";
import { api } from "../../../api";
import { Box, Modal, Text } from "../../../components"
import { useFetch } from "../../../hooks/useFetch";
import { UseModalReturn } from "../../../hooks/useModal"
import { useTrimmerState } from "../../../hooks/useTrimmerState";
import { Trimmer } from "./Trimmer";
import { Waveform } from "./Waveform";

export const TrackEditModal = ({ modalState, trackHash }: { modalState: UseModalReturn, trackHash: string }): JSX.Element => {
  const { isFetching, setFetched, setFetching } = useFetch();
  const trimmerState = useTrimmerState({ start: 0, end: 0, duration: 0 });

  const [waveForm, setWaveForm] = useState<number[]>([]);

  const audioProps = {
    autoPlay: false,
    controls: true,
  };

  useEffect(() => {
    if (!trackHash) {
      return;
    }

    setFetching();

    Promise.all([
      // api.scanner.getWaveform(trackHash).then(setWaveForm),
      api.scanner.getFsItem(trackHash).then(_ => {
        // setFsItem(_);
        trimmerState.setState({ start: _.timings?.trimStart, end: _.timings?.duration - _.timings?.trimEnd, duration: _.timings?.duration });
      }),
    ]).catch(alert).finally(setFetched);
  }, [trackHash]);

  const handleSave = () => {
    api.scanner.setTrim(trackHash, trimmerState.state.start, trimmerState.state.duration - trimmerState.state.end)
      .catch(alert)
      .finally(() => modalState.setOpen(false));
  }

  let content = <Text>Loading...</Text>;

  if (!isFetching) {
    content = (
      <Box flexDirection='column'>
        <audio {...audioProps}>
          <source src={api.scanner.getFileAsPath(trackHash || '')} />
          Your browser does not support the audio element.
        </audio>

        <Waveform data={waveForm} />

        <Box marginTop="-56px">
          <Trimmer state={trimmerState} onSave={handleSave} />
        </Box>
      </Box>
    );
  }

  return (
    <Modal state={modalState}>
      {content}
    </Modal>
  );
}
