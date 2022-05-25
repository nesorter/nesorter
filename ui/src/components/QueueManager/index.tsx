import styles from './styles.module.css';
import { ClassificationCategory, QueueItem, QueueType, ScannedItem } from "../../hooks/types";
import { useCategories } from '../../hooks/useCategories';
import { useEffect, useState } from 'react';

type Props = {
  queue: QueueType;
  items: QueueItem[];
  addInQueue: (queueId: string, filename: string) => Promise<void>;
  onStream: (queueId: string) => void;
}

const QueueManager = ({ queue, items, addInQueue, onStream }: Props): JSX.Element => {
  const [categories] = useCategories();
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [files, setFiles] = useState<ScannedItem[]>([]);

  useEffect(() => {
    const asCategories: ClassificationCategory[] = Object.entries(filters)
      .map(([name, values]) => ({ name, values }));

    /* eslint no-restricted-globals: 0 */
    const url = new URL('/api/files', location.origin);
    asCategories.map(({ name, values }) => {
      values.map(value => {
        url.searchParams.append(`filters[${name}]`, value);
      });
    });

    fetch(url.toString())
      .then(r => r.json() as unknown as ScannedItem[])
      .then(r => setFiles(r))
      .catch(console.error);
  }, [filters]);

  const handleToggle = (catName: string, catValue: string) => {
    setFilters((prev) => {
      if (!prev[catName]) {
        return { ...prev, ...{ [catName]: [catValue] } };
      }

      if (prev[catName].includes(catValue)) {
        return { ...prev, ...{ [catName]: prev[catName].filter(i => i !== catValue) } };
      }

      return { ...prev, ...{ [catName]: [...prev[catName], catValue] } };
    });
  }

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

          <div className={styles.trackRoot} style={{ flexDirection: 'column', borderBottom: '1px solid black' }}>
            {categories.map(category => (
              <div key={category.name} style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px', fontSize: '12px' }}>
                <span>{category.name}:</span>

                {category.values.map(value => (
                  <span
                    key={value}
                    style={
                      filters[category.name]?.includes(value) 
                        ? { fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' } 
                        : { cursor: 'pointer', color: '#999' }
                    }
                    onClick={() => handleToggle(category.name, value)}
                  >{value}</span>
                ))}
              </div>
            ))}
          </div>

          {files.map(file => (
            <div key={file.name}
                 className={styles.trackRoot}
            >
              <button onClick={() => addInQueue(queue.id, file.name)}>Add</button>
              {file.name}
            </div>
          ))}
        </div>

        <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold', paddingBottom: '8px' }}>In queue</span>

          {items.map(item => (
            <div key={item.filePath}>{item.order} {item.filePath}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QueueManager;
