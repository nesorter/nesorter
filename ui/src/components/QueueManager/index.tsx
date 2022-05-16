import styles from './styles.module.css';
import {QueueItem, QueueType} from "../../hooks/types";

type Props = {
  queue: QueueType;
  items: QueueItem[];
  addInQueue: (id: string, filename: string) => Promise<void>;
}

const QueueManager = ({ queue, items, addInQueue }: Props): JSX.Element => {
  return (
    <div className={styles.root}>
      <div style={{ display: "inline-flex", justifyContent: 'space-between', width: '100%' }}>
        <span>{queue.name}</span>
        <button>Stream this queue to icecast</button>
      </div>

      ... tracklist ...
    </div>
  );
}

export default QueueManager;
