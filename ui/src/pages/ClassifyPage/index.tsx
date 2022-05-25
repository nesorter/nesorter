import { useState } from 'react';
import { CatsEditor } from '../../components/CatsEditor';
import Track from '../../components/Track';
import { TrackList } from '../../components/TrackList';
import { ClassificationCategory, ScannedItem } from '../../hooks/types';
import { useCategories } from '../../hooks/useCategories';
import { useData } from '../../hooks/useData';
import styles from './styles.module.css';

const ClassifyPage = () => {
  const [scannedItems] = useData();
  const [categories, onRefresh] = useCategories();
  const [item, setItem] = useState<ScannedItem | undefined>(undefined);

  const editor = <CatsEditor categories={categories} onRefresh={onRefresh} />;

  const setTrackOffset = (offset = 1) => {
    const asEntries = Object.entries(scannedItems).filter(([_key, value]) => value.type === 'file');
    const currentItemIndex = asEntries.findIndex(([_key, value]) => {
      return value.meta?.name === item?.name;
    }) || 0;

    setItem(asEntries[currentItemIndex + offset][1].meta);
  };

  const getPrevTrackCategory = async () => {
    const asEntries = Object.entries(scannedItems).filter(([_key, value]) => value.type === 'file');
    const currentItemIndex: number = asEntries.findIndex(([_key, value]) => {
      return value.meta?.name === item?.name;
    }) || 0;

    try {
      const item = asEntries[currentItemIndex - 1][1].meta;

      if (!item) {
        return [];
      }

      const classification = await fetch(`/api/fileinfo?name=${encodeURIComponent(item.name)}`)
        .then(r => r.json())
        .then(r => r.classification)
        .catch(console.error);

      return classification as ClassificationCategory[];
    } catch {
      return [];
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.navigationRoot}>
        {editor}

        <TrackList
          chain={scannedItems}
          toggleTrack={(item) => {
            if (item) {
              setItem(item);
            }
          }}
        />
      </div>

      {item !== undefined && (
        <div key={item?.path} className={styles.trackRoot}>
          <Track 
            track={item} 
            categories={categories} 
            onNextTrack={() => setTrackOffset(1)}
            onPrevTrack={() => setTrackOffset(-1)}
            getPrevTrackCategory={getPrevTrackCategory}
          />
        </div>
      )}
    </div>
  );
}

export default ClassifyPage;
