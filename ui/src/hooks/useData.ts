import { useEffect, useState } from "react"
import { Chain } from "./types";

export const useData = (): [Chain] => {
  const [items, setItems] = useState<Chain>({});

  useEffect(() => {
    fetch('/api/items/chain')
      .then(r => r.json() as unknown as Chain)
      .then(r => setItems(r))
      .catch(console.error);
  }, []);

  return [items];
}