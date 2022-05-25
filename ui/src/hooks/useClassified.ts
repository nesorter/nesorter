import { useEffect, useState } from "react"
import { ScannedItem } from "./types";

export const useClassified = (): [ScannedItem[], () => void] => {
  const [classified, setClassified] = useState<ScannedItem[]>([]);

  const init = () => {
    fetch('/api/files')
      .then(r => r.json() as unknown as ScannedItem[])
      .then(r => setClassified(r))
      .catch(console.error);
  }

  useEffect(() => {
    init();
  }, []);

  return [classified, () => init()];
}
