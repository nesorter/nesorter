import { useQueues } from './../../hooks/useQueues';
import styles from './styles.module.css';
import QueuesList from "../../components/QueuesList";
import { useState} from "react";
import QueueManager from "../../components/QueueManager";
import {QueueType} from "../../hooks/types";

const SchedulerPage = (): JSX.Element => {
  const [selectedQueue, setSelectedQueue] = useState('');
  const { queues, items, createQueue, addInQueue, stream } = useQueues();

  return (
    <div className={styles.root}>
      <div className={styles.navigationRoot}>
        <QueuesList
          queues={queues}
          createQueue={createQueue}
          onSelect={setSelectedQueue}
          selected={selectedQueue}
        />
      </div>

      <div className={styles.trackRoot}>
        {Boolean(items[selectedQueue]) && (
          <QueueManager
            queue={queues.find(q => q.id === selectedQueue) as QueueType}
            items={items[selectedQueue]}
            addInQueue={addInQueue}
            onStream={(queueId) => stream(queueId)}
          />
        )}
      </div>
    </div>
  );
}

export default SchedulerPage;
