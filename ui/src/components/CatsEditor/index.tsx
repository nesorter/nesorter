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

  const handleSave = async () => {
    const newCats = JSON.parse(asString) as ClassificationCategory[];
    for (let cat of newCats) {
      console.log(JSON.stringify(cat));
      await fetch('/api/classificator/categories', {
        method: cat.id !== undefined ? 'PUT' : 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cat),
      }).catch(console.error);
    }

    onRefresh();
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