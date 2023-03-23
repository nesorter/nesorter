import type { ChainItem } from '@/radio-service/types/Scanner';

export type DirTree = {
  key: string;
  value: string;
  title: string;
  children: DirTree[];
};

export const getDirTreeRecursively = (
  chain: ChainItem[],
  level: number,
  parent?: string,
): DirTree[] => {
  // deadline
  if (!parent && level > 0) {
    return [];
  }

  // root parent
  if (!level) {
    const parentDir = chain.find((_) => _.parent === null);

    return [
      {
        key: parentDir?.key || '',
        value: parentDir?.key || '',
        title: parentDir?.name || '',
        children: getDirTreeRecursively(chain, level + 1, parentDir?.key || ''),
      },
    ];
  }

  // children parents
  return chain
    .filter((_) => _.parent === parent)
    .map((_) => ({
      key: _.key,
      value: _.key,
      title: _.name,
      children: getDirTreeRecursively(chain, level + 1, _.key || ''),
    }));
};

export const getDirChainItemByKey = (chain: ChainItem[], key: string) => {
  const baseDir = chain.find((_) => _.key === key);
  const path = `/${baseDir?.path}`;
  const chainItem = chain.find((_) => _.fsItem?.path.startsWith(path) && _.fsItem?.type === 'dir');

  console.log(chainItem);
  return chainItem;
};

export const getDirKeyByFilehash = (chain: ChainItem[], filehash: string) => {
  const baseDir = chain.find((_) => _.fsItem?.filehash === filehash);
  const [_first, ...path] = (baseDir?.fsItem?.path || '').split('');
  const chainItem = chain.find((_) => _.path?.endsWith(path.join('')) && _.type === 'dir');

  console.log(_first);
  return chainItem;
};
