import { useEffect, useState } from "react";
import { CatsEditor } from "../../components/CatsEditor";
import { PageWrapper } from "../../components/PageWrapper";
import Track from "../../components/Track";
import { TrackList } from "../../components/TrackList";
import { ScannedItem } from "../../hooks/types";
import { useCategories } from "../../hooks/useCategories";
import { useData } from "../../hooks/useData";
import styles from './styles.module.css';

const ClassifyPage = () => {
  const [scannedItems] = useData();
  const [categories, onRefresh] = useCategories();
  const [item, setItem] = useState<ScannedItem | undefined>(undefined);

  const editor = <CatsEditor categories={categories} onRefresh={onRefresh} />;

  return (
    
      <div className={styles.root}>
        <div className={styles.navigationRoot}>
          {/* <div className={styles.nextPrevRoot}>
            <button onClick={() => null}>previous</button>
            <button onClick={() => null}>next</button>
          </div> */}

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
            <Track track={item} categories={categories} />
          </div>
        )}
      </div>
  );
}

export default ClassifyPage;
