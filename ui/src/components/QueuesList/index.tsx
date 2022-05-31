import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { QueueType } from '../../hooks/types';
import { StatedButton } from '../../components/StatedButton';

import styles from './styles.module.css';

type Props = {
  queues: QueueType[];
  createQueue: (name: string, type: ('manual' | 'smart')) => Promise<void>;
  onSelect: (id: number) => void;
  selected: number;
};

export const QueuesList = ({ queues, createQueue, onSelect, selected }: Props): JSX.Element => {
  const form = useForm<{ name: string, type: 'manual' | 'smart' }>({ defaultValues: { type: 'manual' } });
  const [addMode, setAddMode] = useState(false);

  return (
    <div className={styles.root}>
      <div style={{ display: 'inline-flex', justifyContent: 'space-between', width: '100%' }}>
        <span>Queues List</span>
        <button onClick={() => setAddMode(true)}>Add</button>
      </div>

      {addMode && (
        <form className={styles.form} onClick={form.handleSubmit(({ name, type }) => createQueue(name, type))}>
          <input {...form.register('name', { required: true })} placeholder={'name'} />
          <input {...form.register('type', { required: true })} placeholder={'type (manual | smart)'} />
          <button type={'submit'}>Add</button>
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
