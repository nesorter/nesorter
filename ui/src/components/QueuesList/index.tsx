import styles from './styles.module.css';
import {QueueType} from '../../hooks/types';
import {useState} from "react";
import {useForm} from "react-hook-form";
import {StatedButton} from "../../components/StatedButton";

type Props = {
  queues: QueueType[];
  createQueue: (name: string, type: ("manual" | "smart")) => Promise<void>;
  onSelect: (id: string) => void;
  selected: string;
};

const QueuesList = ({ queues, createQueue, onSelect, selected }: Props): JSX.Element => {
  const form = useForm<{ name: string, type: "manual" | "smart" }>({ defaultValues: { type: 'manual' } });
  const [addMode, setAddMode] = useState(false);

  return (
    <div className={styles.root}>
      <div style={{ display: "inline-flex", justifyContent: 'space-between', width: '100%' }}>
        <span>Queues List</span>
        <button onClick={() => setAddMode(true)}>Add</button>
      </div>

      {addMode && (
        <form className={styles.form} onClick={form.handleSubmit(({ name, type }) => createQueue(name, type))}>
          <input {...form.register('name', { required: true })} placeholder={'name'} />
          <input {...form.register('type', { required: true })} placeholder={'type (manual | smart)'} />
          <button type={"submit"}>Add</button>
        </form>
      )}

      {queues.map((queue) => (
        <StatedButton
          key={queue.id}
          onClick={() => onSelect(queue.id)}
          state={selected === queue.id}
        >
          <>{queue.name} ({queue.type})</>
        </StatedButton>
      ))}
    </div>
  );
}

export default QueuesList;
