import { useMemo, useState } from "react";
import styles from './styles.module.css';
import { Chain, ChainItem } from "../../hooks/types";
import dirIconPath from './icons/dir.svg';
import fileIconPath from './icons/file.svg';

type Props = {
  chain: Chain;
  toggleTrack: (item?: ChainItem) => void;
}

export const TrackList = ({ chain, toggleTrack }: Props): JSX.Element => {
  const [opened, setOpened] = useState<string[]>([]);
  const initial = useMemo(() => Object.entries(chain).find(([key, item]) => item.parent === null), [chain]);

  if (!initial) {
    return <span />;
  }

  return (
    <div className={styles.root}>
      <RecursiveList
        root
        chain={chain}
        target={initial[0]}
        opened={opened}
        onToggle={(isOpen, target) => {
          if (target.includes('.mp3')) {
            toggleTrack(chain[target]);
          }

          setOpened((prev) => {
            let copy = [...prev];

            if (isOpen && !prev.includes(target)) {
              copy = [...prev, target];
            } else {
              copy = prev.filter(i => i !== target);
            }

            return copy.filter(i => {
              if (target.includes('.mp3')) {
                if (i.includes('.mp3') && i !== target) {
                  return false;
                }
              }

              return true;
            });
          });
        }}
      />
    </div>
  );
}

const RecursiveList = ({ chain, target, opened, onToggle, root = false }: {
  chain: Chain;
  target: string;
  opened: string[];
  onToggle: (next: boolean, target: string) => void;
  root?: boolean;
}): JSX.Element => {
  const isOpened = opened.includes(target);
  const item = chain[target];
  const children = item.type === 'file' || !isOpened
    ? []
    : Object.values(chain).filter((subitem) => subitem.parent === target);

  const icon = <img src={item.type === 'dir' ? dirIconPath : fileIconPath} alt="icon" />;

  return (
    <div className={[styles.subRoot, root ? styles.subRootButRoot : ''].join(' ')}>

      <div
        className={[styles.item, item.type === 'dir' ? styles.itemDir : '', isOpened && item.type !== 'dir' ? styles.itemActive : ''].join(' ')}
        onClick={() => onToggle(!isOpened, target)}
      >
        <div style={{ display: 'flex', gap: '7px', width: '100%' }}>
          {icon} <span className={styles.itemName}>{item.name}</span>
        </div>

        {item.type === 'file' && <div style={{ fontSize: '10px' }}>{item.fsItemMeta?.id3Artist} - {item.fsItemMeta?.id3Title}</div>}
      </div>

      {isOpened && Boolean(children.length) && children.map(child => (
        <RecursiveList
          key={child.key}
          chain={chain}
          target={child.key}
          opened={opened}
          onToggle={onToggle}
        />
      ))}

    </div>
  );
}