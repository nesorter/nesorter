import { useState } from 'react';
import { CatsEditor } from '../../components/CatsEditor';
import Track from '../../components/Track';
import { TrackList } from '../../components/TrackList';
import { ClassificationCategory } from '../../hooks/types';
import { useCategories } from '../../hooks/useCategories';
import { useChain } from '../../hooks/useChain';
import styles from './styles.module.css';

const ClassifyPage = () => {
  const [chain] = useChain();
  const [categories, onRefresh] = useCategories();
  const [selectedFilehash, setSelectedFilehash] = useState<string>('');

  const editor = <CatsEditor categories={categories} onRefresh={onRefresh} />;

  const setTrackOffset = (offset = 1) => {
    const asEntries = Object.entries(chain).filter(([_key, value]) => value.type === 'file');
    const currentItemIndex = asEntries.findIndex(([_key, value]) => {
      return value.fsItem?.filehash === selectedFilehash;
    }) || 0;

    setSelectedFilehash(asEntries[currentItemIndex + offset][1].fsItem?.filehash || '');
  };

  const getPrevTrackCategory = async () => {
    const asEntries = Object.entries(chain).filter(([_key, value]) => value.type === 'file');
    const currentItemIndex = asEntries.findIndex(([_key, value]) => {
      return value.fsItem?.filehash === selectedFilehash;
    }) || 0;

    try {
      const hash = asEntries[currentItemIndex - 1][1].fsItem?.filehash || '';

      if (!hash) {
        return [];
      }

      const classification = await fetch(`/api/classificator/item/${encodeURIComponent(hash)}`)
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
          chain={chain}
          toggleTrack={(item) => {
            if (item) {
              setSelectedFilehash(item.fsItem?.filehash || '');
            }
          }}
        />
      </div>

      {selectedFilehash !== undefined && (
        <div key={selectedFilehash} className={styles.trackRoot}>
          <Track
            track={Object.values(chain).find(i => i.fsItem?.filehash === selectedFilehash)}
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
