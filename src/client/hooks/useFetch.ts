import { useState } from 'react';

export const useFetch = () => {
  const [fetching, setFetching] = useState(false);

  return {
    isFetching: fetching,
    setFetching: () => setFetching(true),
    setFetched: () => setFetching(false),
  };
};
