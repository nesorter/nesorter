import React, { useMemo, useState } from "react";
import { Chain, ChainItem } from "../../../../api/types";
import { Box, Text } from "../../../../components";
import { Icon } from "../../../../components/Icon";

type Props = {
  chain: Chain;
  selectedTrack: string;
  setSelectedTrack: (key: string) => void;
};

export const TrackTree = ({ chain, selectedTrack, setSelectedTrack }: Props): JSX.Element => {
  // TODO: искать такого родителя, в котором больше одной дочерней связи
  const rootKey = useMemo(() => Object.values(chain).find(_ => _.parent === null)?.key, [chain]);

  const content = rootKey
    ? <Recursive rootKey={rootKey}
                 chain={chain}
                 step={0}
                 selectedTrack={selectedTrack}
                 setSelectedTrack={setSelectedTrack}
      />
    : <Text>Chain empty?</Text>

  return (
    <Box backgroundColor="dark200"
         borderRadius="4px"
         width="100%"
         height="100%"
         maxHeight="100%"
         flexDirection="column"
         overflowY="auto"
         overflowX="hidden"
    >
      {content}
    </Box>
  );
}

type RecursiveProps = {
  rootKey: string;
  chain: Chain;
  step: number;
  selectedTrack: string;
  setSelectedTrack: (key: string) => void;
}

const Recursive = ({ rootKey, chain, step, selectedTrack, setSelectedTrack }: RecursiveProps): JSX.Element => {
  const [openedKeys, setOpened] = useState<string[]>([]);
  const children = useMemo(() => Object.values(chain).filter(_ => _.parent === rootKey), [chain, rootKey]);

  const handleOpen = ({ key, type }: ChainItem) => {
    if (type === 'dir') {
      setOpened(_ => {
        if (_.includes(key)) {
          return _.filter(i => i !== key);
        }
        return [..._, key];
      });
    } else {
      setSelectedTrack(key);
    }
  }

  return (
    <>
      {children.map(_ => (
        <React.Fragment key={_.key}>
          <Box padding="7px"
               borderBottom="1px solid #777"
               backgroundColor={_.key === selectedTrack ? '#60834B' : 'transparent'}
               width="100%"
               style={{ cursor: 'pointer' }}
               onClick={() => handleOpen(_)}
          >
            <Box width="100%"
                 paddingLeft={`${step * 7}px`}
                 gap={7}
                 flexDirection="column"
            >
              <Box gap={7} alignItems="center" width="100%">
                <Icon name={step === 0 ? 'root' : _.type} color="#999" size={14} />

                {_.type === 'file'
                  ? <Text minWidth="12px" fontSize="sm" color="textLight" variant="oneline">{_.isClassified ? '✅' : '🚫'}</Text>
                  : null
                }

                <Text fontSize="sm" color="textLight" variant="oneline">
                  {_.type === 'file'
                    ? <>{_.fsItem?.id3Artist} - {_.fsItem?.id3Title}</>
                    : <>{_.name}</>
                  }
                </Text>
              </Box>

              {_.type !== 'file' ? null : (
                <Box gap={7} alignItems="center" width="100%">
                  <Text fontSize="10px" color="textLight" variant="oneline">
                    {_.name}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {_.type !== 'dir'
            ? null
            : openedKeys.includes(_.key) && <Recursive rootKey={_.key} chain={chain} step={step + 1} selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack} />
          }
        </React.Fragment>
      ))}
    </>
  );
}
