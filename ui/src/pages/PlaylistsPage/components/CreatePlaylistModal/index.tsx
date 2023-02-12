import { useForm } from "react-hook-form";
import { api } from "../../../../api";
import { Modal, Box, Text } from "../../../../components";
import { UseModalReturn } from "../../../../hooks/useModal";
import { MultiSelect, Option } from 'react-multi-select-component';
import React, { useEffect, useState } from 'react';
import { ChainItem } from '../../../../api/types';
import styles from './styles.module.css';

type Props = {
  state: UseModalReturn;
  onCreate: () => void;
}

type FormType = {
  name: string,
  type: 'manual' | 'fs'
};

export const CreatePlaylistModal = ({ state, onCreate }: Props) => {
  const [chain, setChain] = useState<ChainItem[]>([]);
  const { register, handleSubmit, reset, setValue } = useForm<FormType>();
  const [selected, setSelected] = useState<Option[]>([]);

  useEffect(() => {
    api.scanner.getChain()
      .then((chain) => {
        const values = Object.values(chain);
        setChain(values.filter(_ => _.type === 'file' && _.fsItem?.type === 'dir'))
      })
      .catch(console.log);
  }, []);

  const handleCreate = (values: FormType) => {
    api.playlistsManager.createPlaylist(values.name, values.type, selected[0]?.value)
      .then(() => {
        reset();
        state.setOpen(false);
        onCreate();
      })
      .catch(alert);
  }

  return (
    <Modal state={state}>
      <form
        onSubmit={handleSubmit(handleCreate)}
      >
        <Box flexDirection="column" gap={24}>
          <Box alignItems="baseline" gap={8}>
            <Text>name: </Text>
            <input {...register('name', { required: true })} placeholder="playlist name" />
          </Box>

          <Box alignItems="baseline" gap={8}>
            <Text>type: </Text>
            <input {...register('type', { required: true })} placeholder="manual || fs" />
          </Box>

          <Box alignItems="baseline" gap={8} flexDirection="column" width={600}>
            <Text>path (for fs playlist, skip if u create manual playlist): </Text>
            <MultiSelect
              className={styles.select}
              options={chain.map(_ => ({ value: _.fsItem?.filehash, label: `${_.fsItem?.name} (${_.fsItem?.path})` }))}
              value={selected}
              onChange={(selected: Option[]) => {
                const item = selected[0];
                if (item) {
                  setValue('type', 'fs');
                  setValue('name', item.label);
                }

                setSelected(selected);
              }}
              labelledBy="Select"
            />
          </Box>

          <button type="submit">Create</button>
        </Box>
      </form>
    </Modal>
  );
}
