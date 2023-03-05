import React from 'react';

import { Box } from '../Box';
import { ReactComponent as DirIcon } from './assets/dir.svg';
import { ReactComponent as FileIcon } from './assets/file.svg';
import { ReactComponent as RootIcon } from './assets/root.svg';

type IconName = 'root' | 'dir' | 'file';
const map: Record<IconName, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
  root: RootIcon,
  dir: DirIcon,
  file: FileIcon,
};

export const Icon = ({
  name,
  color,
  size,
}: {
  name: IconName;
  color: string;
  size: number;
}): JSX.Element => {
  const Component = map[name];

  return (
    <Box minWidth={size} minHeight={size}>
      <Component color={color} width={size} height={size} />
    </Box>
  );
};
