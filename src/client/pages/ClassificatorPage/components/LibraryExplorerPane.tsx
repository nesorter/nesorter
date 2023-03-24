import { useStore } from '@nanostores/react';
import { Card, Tree } from 'antd';
import React from 'react';

import { setSelectedTrackKey, StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';

export const LibraryExplorerPane = () => {
  const { tree } = useStore(StoreClassifyPage);

  return (
    <Card title='Library explorer' style={{ width: 380 }}>
      <Tree
        showIcon
        checkedKeys={[]}
        treeData={tree}
        checkable={false}
        onCheck={console.log}
        onSelect={(item) => {
          const [selectedKey] = item;
          setSelectedTrackKey(selectedKey as string);
        }}
        showLine={{ showLeafIcon: true }}
        autoExpandParent
        height={450}
      />
    </Card>
  );
};
