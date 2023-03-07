import { useEffect, useMemo, useState } from 'react';

import { api } from '@/client/api';
import { Box, Button, Text } from '@/client/components';
import { useFetch } from '@/client/hooks/useFetch';
import type { AggregatedFileItem, Chain } from '@/radio-service/types/Scanner';

type Props = {
  onAdd: (hash: string) => unknown;
  onAddAll: (hashes: string[]) => Promise<void>;
};

export const Library = ({ onAdd, onAddAll }: Props) => {
  const chainFetch = useFetch();
  const catsFetch = useFetch();

  const [chain, setChain] = useState<Chain>({});

  const chainValues = useMemo(() => Object.values(chain), [chain]);
  const [files, setFiles] = useState<AggregatedFileItem[]>([]);

  useEffect(() => {
    chainFetch.setFetching();
    // catsFetch.setFetching();

    // api.categories.get()
    //   .then(setCategories)
    //   .catch(alert)
    //   .finally(catsFetch.setFetched);

    api.scanner
      .getChain()
      .then((chain) => setChain(chain.data))
      .catch(alert)
      .finally(chainFetch.setFetched);
  }, []);

  // useEffect(() => {
  //   if (!chainValues.length) {
  //     return;
  //   }
  //
  //   /* eslint no-restricted-globals: 0 */
  //   const url = new URL('/api/classificator/items', location.origin);
  //   filters.forEach(({ name, values }) => {
  //     values.forEach((value) => {
  //       url.searchParams.append(`filters[${name}]`, value);
  //     });
  //   });
  //
  //   fetch(url.toString())
  //     .then(r => r.json() as unknown as { filehash: string; categories: ClassificationCategory[]; }[])
  //     .then(r => setFiles(
  //       r.map(({ filehash }) => {
  //         return chainValues.find(i => i.fsItem?.filehash === filehash)?.fsItem
  //       }).filter(i => i !== undefined) as FSItem[]
  //     ))
  //     .catch(console.error);
  // }, [filters, chainValues]);

  return (
    <Box flexDirection='column' width='100%'>
      <Box width='100%' padding='10px' borderBottom='1px solid #5C5C5C' flexDirection='column'>
        {catsFetch.isFetching && (
          <Text fontSize='desc' color='textLight'>
            cats fetching
          </Text>
        )}
      </Box>

      <Box width='100%' padding='10px' flexDirection='column' gap={10}>
        {chainFetch.isFetching && (
          <Text fontSize='desc' color='textLight'>
            tracks fetching
          </Text>
        )}

        {Boolean(files.length) && (
          <Button
            variant='primary'
            size='small'
            onClick={() => onAddAll(files.map((_) => _.filehash)).catch((e) => alert(e))}
          >
            Add all
          </Button>
        )}

        {files.map((item) => {
          const file = chainValues.find((i) => i.fsItem?.filehash === item.filehash);

          return (
            <Box key={item.filehash} alignItems='center' justifyContent='space-between'>
              <Box flexDirection='column' maxWidth='calc(100% - 96px)'>
                <Text fontSize='desc' variant='oneline' color='textLight'>
                  {file?.fsItem?.metadata?.artist} - {file?.fsItem?.metadata?.title}
                </Text>

                <Text fontSize='sm' variant='oneline' color='#999'>
                  {file?.fsItem?.path}
                </Text>
              </Box>

              <Button onClick={() => onAdd(item.filehash)} variant='secondary' size='small'>
                +
              </Button>
            </Box>
          );
        })}

        {!Boolean(files.length) && (
          <Text fontSize='desc' color='textLight'>
            None found. Try add files to categories or another filters
          </Text>
        )}
      </Box>
    </Box>
  );
};
