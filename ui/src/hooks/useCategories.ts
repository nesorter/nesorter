import { useEffect, useState } from "react"
import { ClassificationCategory } from "./types";

export const useCategories = (): [ClassificationCategory[], () => void] => {
  const [categories, setCategories] = useState<ClassificationCategory[]>([]);

  const init = () => {
    fetch('/api/classificator/categories')
      .then(r => r.json() as unknown as ClassificationCategory[])
      .then(r => setCategories(r))
      .catch(console.error);
  }

  useEffect(() => {
    init();
  }, []);

  return [categories, () => init()];
}