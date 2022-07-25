import { useForm } from "react-hook-form";
import { api } from "../../../../api";
import { Modal } from "../../../../components";
import { UseModalReturn } from "../../../../hooks/useModal";

type Props = {
  state: UseModalReturn;
  onCreate: () => void;
}

export const CreatePlaylistModal = ({ state, onCreate }: Props) => {
  const { register, handleSubmit, reset } = useForm<{ name: string }>();

  return (
    <Modal state={state}>
      <form
        onSubmit={handleSubmit((values) => {
          api.playlistsManager.createPlaylist(values.name, 'manual')
            .then(() => {
              reset();
              state.setOpen(false);
              onCreate();
            })
            .catch(alert);
        })}
      >
        <input {...register('name')} placeholder="name" />
        <button type="submit">Create</button>
      </form>
    </Modal>
  );
}
