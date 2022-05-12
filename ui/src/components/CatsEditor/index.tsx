import { useEffect, useState } from "react"
import { ClassificationCategory } from "../../hooks/types"

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
    <div>
      <button onClick={() => setIsEdit(p => !p)}>toggle edit mode</button>

      {isEdit && (
        <div>
          <textarea value={asString} onChange={(ev => setAsString(ev.target.value))} />
          <button onClick={handleSave}>push to api</button>
        </div>
      )}
    </div>
  );
}