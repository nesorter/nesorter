import { useEffect, useState } from "react"
import { api } from "../../../../api";
import { Chain, ClassificationCategory, FSItem } from "../../../../api/types";
import { Box, Button, Text } from "../../../../components"
import { useFetch } from "../../../../hooks/useFetch";

type Props = {
  onAdd: (hash: string) => unknown;
}

export const Library = ({ onAdd }: Props) => {
  const chainFetch = useFetch();
  const catsFetch = useFetch();

  const [chain, setChain] = useState<Chain>({});
  const [categories, setCategories] = useState<ClassificationCategory[]>([]);

  const chainValues = Object.values(chain);
  const [filters, setFilters] = useState<ClassificationCategory[]>([]);
  const [files, setFiles] = useState<FSItem[]>([]);

  useEffect(() => {
    chainFetch.setFetching();
    catsFetch.setFetching();

    api.categories.get()
      .then(setCategories)
      .catch(alert)
      .finally(catsFetch.setFetched);

    api.scanner.getChain()
      .then(setChain)
      .catch(alert)
      .finally(chainFetch.setFetched);
  }, []);

  useEffect(() => {
    if (!chainValues.length) {
      return;
    }

    /* eslint no-restricted-globals: 0 */
    const url = new URL('/api/classificator/items', location.origin);
    filters.forEach(({ name, values }) => {
      values.forEach((value) => {
        url.searchParams.append(`filters[${name}]`, value);
      });
    });

    fetch(url.toString())
      .then(r => r.json() as unknown as { filehash: string; categories: ClassificationCategory[]; }[])
      .then(r => setFiles(
        r.map(({ filehash }) => {
          return chainValues.find(i => i.fsItem?.filehash === filehash)?.fsItem
        }).filter(i => i !== undefined) as FSItem[]
      ))
      .catch(console.error);
  }, [filters, chainValues.length]);

  const handleToggle = (catId: number, catName: string, catValue: string) => {
    setFilters((prev) => {
      let copy = [...prev];
      const index = copy.findIndex((cat) => cat.id === catId);

      if (index !== -1) {
        if (copy[index].values.includes(catValue)) {
          copy[index].values = copy[index].values.filter((value) => value !== catValue);

          if (copy[index].values.length === 0) {
            copy = copy.filter((_i, _index) => _index !== index);
          }
        } else {
          copy[index].values = [...copy[index].values, catValue];
        }
      } else {
        copy.push({ id: catId, name: catName, values: [catValue] });
      }

      return copy;
    });
  }

  return (
    <Box flexDirection="column" width="100%">
      <Box width="100%" padding="10px" borderBottom="1px solid #5C5C5C" flexDirection="column">
        {catsFetch.isFetching && <Text fontSize="desc" color="textLight">cats fetching</Text>}
        {categories.map((category) => (
          <Box key={category.name} gap={7} flexWrap="wrap" style={{ rowGap: '2px' }}>
            <Text size="sm" width="86px" color="textLight">{category.name}:</Text>

            {category.values.map((value) => {
              const selected = filters.findIndex((cat) => cat.id === category.id && cat.values.includes(value)) !== -1;

              return (
                <Text
                  key={value}
                  fontWeight={selected ? 'bold' : 'initial'}
                  color={selected ? 'textLight' : '#999'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleToggle(category.id, category.name, value)}
                >
                  {value}
                </Text>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box width="100%" padding="10px" flexDirection="column" gap={10}>
        {chainFetch.isFetching && <Text fontSize="desc" color="textLight">tracks fetching</Text>}
        {files.map((item) => {
          const file = chainValues.find(i => i.fsItem?.filehash === item.filehash);

          return (
            <Box key={item.filehash} alignItems="center" justifyContent="space-between">
              <Box flexDirection="column" maxWidth="calc(100% - 96px)">
                <Text fontSize="desc" variant="oneline" color="textLight">
                  {file?.fsItem?.id3Artist} - {file?.fsItem?.id3Title}
                </Text>

                <Text fontSize="sm" variant="oneline" color="#999">
                  {file?.fsItem?.path}
                </Text>
              </Box>

              <Button onClick={() => onAdd(item.filehash)} variant="secondary" size="small">+</Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
