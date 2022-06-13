import styles from './styles.module.css';
import { ClassificationCategory, QueueItem, QueueType, FSItem } from "../../hooks/types";
import { useCategories } from '../../hooks/useCategories';
import { useEffect, useState } from 'react';
import { useChain } from '../../hooks/useChain';

type Props = {
  queue: QueueType;
  items: QueueItem[];
  addInQueue: (queueId: number, filename: string) => Promise<void>;
  onStream: (queueId: number) => void;
  onStop: () => void;
}

export const QueueManager = ({ queue, items, addInQueue, onStream, onStop }: Props): JSX.Element => {
  const [categories] = useCategories();
  const [chain] = useChain();
  const chainValues = Object.values(chain);
  const [filters, setFilters] = useState<ClassificationCategory[]>([]);
  const [files, setFiles] = useState<FSItem[]>([]);

  useEffect(() => {
    if (!chainValues.length) {
      return;
    }

    /* eslint no-restricted-globals: 0 */
    const url = new URL('/api/classificator/items', location.origin);
    filters.forEach(({ name, values }) => {
      values.forEach((value) => {
        url.searchParams.append(`filters[${name}]`, value);
      });
    });

    fetch(url.toString())
      .then(r => r.json() as unknown as { filehash: string; categories: ClassificationCategory[]; }[])
      .then(r => setFiles(
        r.map(({ filehash }) => {
          return chainValues.find(i => i.fsItem?.filehash === filehash)?.fsItem
        }).filter(i => i !== undefined) as FSItem[]
      ))
      .catch(console.error);
  }, [filters, chainValues.length]);

  const handleToggle = (catId: number, catName: string, catValue: string) => {
    setFilters((prev) => {
      let copy = [...prev];
      const index = copy.findIndex((cat) => cat.id === catId);

      if (index !== -1) {
        if (copy[index].values.includes(catValue)) {
          copy[index].values = copy[index].values.filter((value) => value !== catValue);

          if (copy[index].values.length === 0) {
            copy = copy.filter((_i, _index) => _index !== index);
          }
        } else {
          copy[index].values = [...copy[index].values, catValue];
        }
      } else {
        copy.push({ id: catId, name: catName, values: [catValue] });
      }

      return copy;
    });
  }

  return (
    <div className={styles.root}>
      <div style={{ display: "inline-flex", justifyContent: 'space-between', width: '100%' }}>
        <span>{queue.name}</span>
        <button
          onClick={() => onStream(queue.id)}
        >Stream this queue to icecast</button>

        <button
          onClick={onStop}
        >Stop</button>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'bold', paddingBottom: '8px' }}>Classified</span>

          <div className={styles.trackRoot} style={{ flexDirection: 'column', borderBottom: '1px solid black' }}>
            {categories.map((category) => (
              <div key={category.name} style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px', fontSize: '12px' }}>
                <span>{category.name}:</span>

                {category.values.map((value) => (
                  <span
                    key={value}
                    style={
                      filters.findIndex((cat) => cat.id === category.id && cat.values.includes(value)) !== -1
                        ? { fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' } 
                        : { cursor: 'pointer', color: '#999' }
                    }
                    onClick={() => handleToggle(category.id, category.name, value)}
                  >{value}</span>
                ))}
              </div>
            ))}
          </div>

          {files.map((item) => {
            const file = chainValues.find(i => i.fsItem?.filehash === item.filehash);

            return (
              <div
                key={item.filehash}
                className={styles.trackRoot}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <span>
                  <button onClick={() => addInQueue(queue.id, file?.fsItem?.filehash || '')}>+</button>{' '}
                  {file?.fsItemMeta?.id3Artist} - {file?.fsItemMeta?.id3Title}
                </span>
                <span style={{ fontSize: '12px' }}>{file?.fsItem?.path}</span>
              </div>
            );
          })}
        </div>

        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <span style={{ fontWeight: 'bold', paddingBottom: '8px' }}>In queue</span>

          {items.map((item) => {
            const file = chainValues.find(i => i.fsItem?.filehash === item.filehash);

            return (
              <div
                key={item.filehash}
                className={styles.trackRoot}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <span>{file?.fsItemMeta?.id3Artist} - {file?.fsItemMeta?.id3Title}</span>
                <span style={{ fontSize: '12px' }}>{file?.fsItem?.path}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
