import { useState } from 'react';
import { useQueues } from '../../hooks/useQueues';
import { QueueType } from '../../hooks/types';
import { QueuesList } from '../../components/QueuesList';
import { QueueManager } from '../../components/QueueManager';

import styles from './styles.module.css';

const SchedulerPage = (): JSX.Element => {
  const [selectedQueue, setSelectedQueue] = useState(0);
  const { queues, items, createQueue, addInQueue, stream, stop } = useQueues();

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
            onStop={stop}
            onStream={(queueId) => stream(queueId)}
          />
        )}
      </div>
    </div>
  );
}

export default SchedulerPage;
