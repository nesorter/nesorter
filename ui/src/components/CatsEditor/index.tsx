import { useEffect, useState } from "react"
import { ClassificationCategory } from "../../hooks/types"
import { StatedButton } from "../StatedButton";
import styles from './styles.module.css';

export const CatsEditor = ({ categories, onRefresh }: { categories: ClassificationCategory[], onRefresh: () => void }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [asString, setAsString] = useState('');

  useEffect(() => {
    setAsString(JSON.stringify(categories, null, 1));
  }, [categories]);

  const handleSave = () => {
    fetch('/api/update_cats', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: asString,
    }).then(onRefresh).catch(console.error);
  };

  return (
    <div className={styles.root}>
      <StatedButton state={isEdit} onClick={setIsEdit}>Category editor</StatedButton>

      {isEdit && (
        <div className={styles.editor}>
          <textarea style={{ height: 320 }} value={asString} onChange={(ev => setAsString(ev.target.value))} />
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  );
}