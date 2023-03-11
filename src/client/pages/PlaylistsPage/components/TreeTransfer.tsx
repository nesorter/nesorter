import { theme, Transfer, Tree } from 'antd';
import type { TransferDirection, TransferItem } from 'antd/es/transfer';
import type { DataNode } from 'antd/es/tree';
import React from 'react';

export type TreeTransferProps = {
  dataSource: DataNode[];
  targetKeys: string[];
  onChange: (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void;
};

// Customize Table Transfer
export const isChecked = (selectedKeys: (string | number)[], eventKey: string | number) =>
  selectedKeys.includes(eventKey);

export const generateTree = (treeNodes: DataNode[] = [], checkedKeys: string[] = []): DataNode[] =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key as string),
    children: generateTree(children, checkedKeys),
  }));

export const TreeTransfer = ({ dataSource, targetKeys, ...restProps }: TreeTransferProps) => {
  const { token } = theme.useToken();

  const transferDataSource: TransferItem[] = [];
  function flatten(list: DataNode[] = []) {
    list.forEach((item) => {
      transferDataSource.push(item as TransferItem);
      flatten(item.children);
    });
  }
  flatten(dataSource);

  return (
    <Transfer
      {...restProps}
      targetKeys={targetKeys}
      dataSource={transferDataSource}
      className='tree-transfer'
      render={(item) => item.title!}
      showSelectAll={false}
    >
      {({ direction, onItemSelect, selectedKeys }) => {
        if (direction === 'left') {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <div style={{ padding: token.paddingXS }}>
              <Tree
                blockNode
                checkable
                checkStrictly
                checkedKeys={checkedKeys}
                treeData={generateTree(dataSource, targetKeys)}
                onCheck={(_, { node: { key } }) => {
                  onItemSelect(key as string, !isChecked(checkedKeys, key));
                }}
                onSelect={(_, { node: { key } }) => {
                  onItemSelect(key as string, !isChecked(checkedKeys, key));
                }}
              />
            </div>
          );
        }
      }}
    </Transfer>
  );
};
