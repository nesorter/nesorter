import styles from './styles.module.css';
import {QueueItem, QueueType} from "../../hooks/types";
import {useClassified} from "../../hooks/useClassified";

type Props = {
  queue: QueueType;
  items: QueueItem[];
  addInQueue: (queueId: string, filename: string) => Promise<void>;
  onStream: (queueId: string) => void;
}

const QueueManager = ({ queue, items, addInQueue, onStream }: Props): JSX.Element => {
  const [files] = useClassified();

  return (
    <div className={styles.root}>
      <div style={{ display: "inline-flex", justifyContent: 'space-between', width: '100%' }}>
        <span>{queue.name}</span>
        <button
          onClick={() => onStream(queue.id)}
        >Stream this queue to icecast</button>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'bold', paddingBottom: '8px' }}>Classified</span>

          {files.map(file => (
            <div key={file.name}
                 onClick={() => addInQueue(queue.id, file.name)}
                 style={{ cursor: 'pointer' }}
            >
              {file.name}
            </div>
          ))}
        </div>

        <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold', paddingBottom: '8px' }}>In queue</span>

          {items.map(item => (
            <div key={item.filePath}>{item.filePath}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QueueManager;
