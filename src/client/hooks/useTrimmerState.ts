import { useState } from 'react';

export type TrimmerState = { start: number; end: number; duration: number };
export type UseTrimmerStateReturn = {
  state: TrimmerState;
  setState: React.Dispatch<React.SetStateAction<TrimmerState>>;
};

export const useTrimmerState = (defaultState: TrimmerState): UseTrimmerStateReturn => {
  const [state, setState] = useState(defaultState);
  return { state, setState };
};
