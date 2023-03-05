import { useState } from "react"

export type UseModalReturn = { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> };

export const useModal = (defaultState = false) => {
  const [open, setOpen] = useState(defaultState);
  return { open, setOpen };
}
