import { useEffect, useState } from 'react';
import { api } from '../../../api';
import { ChainItem, ClassificationCategory } from '../../../api/types';
import { Box, Button, StatedButton, Text } from '../../../components';

type Props = {
  track: ChainItem;
  onTrackEdit: () => void;
  onHandleApplyAll: (fileHash: string, categories: ClassificationCategory[]) => Promise<void>;
}

export const Track = ({ track, onTrackEdit, onHandleApplyAll }: Props): JSX.Element => {
  const [applyFetching, setApplyFetching] = useState(false);
  const [defaultCategories, setDefaultCategories] = useState<ClassificationCategory[]>([]);
  const [categories, setCategories] = useState<ClassificationCategory[]>([]);
  const audioProps = {
    autoPlay: false,
    controls: true,
  };

  useEffect(() => {
    api.categories.get()
      .then(setDefaultCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    api.classificator.getClassifiedCategory(track.fsItem?.filehash || '')
      .then(setCategories)
      .catch(console.error);
  }, [track.fsItem?.filehash]);

  const handleApply = (catId: number, catName: string, tagName: string, state: boolean) => {
    setCategories((prev) => {
      const next = prev.map(cat => {
        if (cat.id === catId) {
          if (cat.values.includes(tagName)) {
            return { ...cat, values: cat.values.filter(_ => _ !== tagName) };
          } else {
            return { ...cat, values: [...cat.values, tagName] };
          }
        }

        return cat;
      });

      if (next.find(_ => _.id === catId) === undefined) {
        next.push({
          id: catId,
          name: catName,
          values: [tagName],
        });
      }

      api.classificator.setCategories(track.fsItem?.filehash || '', next);
      return next;
    });
  };

  const TrackInfo = () => (
    <Box gap={14} width="100%">
      <Box backgroundColor="#999" width="140px" height="140px" borderRadius="8px" overflow="hidden">
        <img src={api.scanner.getFileImageAsPath(track?.fsItem?.filehash || '')} alt="" style={{ objectFit: 'cover' }}/>
      </Box>

      <Box width="100%" maxWidth="550px" flexDirection="column" gap={7} justifyContent="space-between">
        <Box flexDirection="column">
          <Text fontSize="body" color="textLight">{track?.fsItem?.metadata?.artist} - {track?.fsItem?.metadata?.title}</Text>
          <Text fontSize="sm" color="#999" fontWeight="300">{track?.fsItem?.path}</Text>
        </Box>

        <Box flexDirection="column" gap={7}>
          <audio {...audioProps}>
            <source src={api.scanner.getFileAsPath(track?.fsItem?.filehash || '')}/>
            Your browser does not support the audio element.
          </audio>

          <Box gap={7} justifyContent="space-between">
            <Box gap={7}>
              <Button variant="secondary" size="normal" disabled={applyFetching} onClick={() => {
                setApplyFetching(true);

                onHandleApplyAll(track.fsItem?.filehash || '', categories)
                  .then(() => {
                    alert('done, run "sync" (in status page) for update global chain state');
                  })
                  .catch((e) => {
                    alert(e.message);
                  })
                  .finally(() => {
                    setApplyFetching(false);
                  });
              }}>Apply to all tracks in category</Button>
            </Box>

            <Button variant="secondary" size="normal" onClick={onTrackEdit}>Open track editor</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const Categories = () => (
    <Box width="100%" flexDirection="column" gap={7}>
      {defaultCategories.map(_ => (
        <Box width="100%" key={_.id} flexWrap="wrap" gap={7} alignItems="center">
          <Box width="100%" maxWidth="86px">
            <Text color="textLight" fontSize="desc">{_.name}</Text>
          </Box>

          {_.values.map(v => (
            <StatedButton key={v}
                          flag={categories.find(i => i.name === _.name)?.values.includes(v) || false}
                          onNextState={(state) => handleApply(_.id, _.name, v, state)}
                          size="small"
            >
              {v}
            </StatedButton>
          ))}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box width="100%" flexDirection="column" gap={14}>
      <TrackInfo/>
      <Categories/>
    </Box>
  );
};
