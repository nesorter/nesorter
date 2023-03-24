import { useStore } from '@nanostores/react';
import { Button, Card, Space, Typography } from 'antd';
import Image from 'next/image';
import React from 'react';

import { api } from '@/client/api';
import { useSelectedFileItem } from '@/client/hooks/queries/useSelectedFileItem';
import { setIsListening, StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';

export const SelectedTrack = () => {
  const { isListening, selectedTrack, classEditMode, audio, categories } =
    useStore(StoreClassifyPage);

  const trackQuery = useSelectedFileItem(selectedTrack?.fsItem?.filehash);

  const handleListen = () => {
    if (isListening) {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    } else {
      if (audio) {
        audio.src = api.scanner.getFileAsPath(trackQuery.data?.filehash || '');
        audio.play().catch(console.error);
      }
    }

    setIsListening(!isListening);
  };

  const handleCheckClassItem = (classItemId: number, isChecked: boolean) => {
    api.categories
      .updateTrackData(trackQuery?.data?.filehash || '', {
        filehash: trackQuery?.data?.filehash || '',
        classItemsIds: isChecked
          ? [...(trackQuery?.data?.classedItems || []).map((_) => _.classItemId), classItemId]
          : (trackQuery?.data?.classedItems || [])
              .map((_) => _.classItemId)
              .filter((_) => _ !== classItemId),
      })
      .catch(console.error)
      .finally(() => trackQuery.refetch());
  };

  if (!Boolean(selectedTrack) || classEditMode) {
    return null;
  }

  const categoriesRendered = categories.map((category) => (
    <Space key={category.id} align='baseline' wrap>
      <Typography.Text style={{ display: 'inline-block', minWidth: '80px' }}>
        {category.name}
      </Typography.Text>

      {category.items?.map((item) => {
        const isChecked =
          (trackQuery.data?.classedItems || []).find(
            (aggregatedItem) => aggregatedItem.classItemId === item.id,
          ) !== undefined;

        return (
          <Button
            size='small'
            key={item.id}
            onClick={() => handleCheckClassItem(item.id, !isChecked)}
            type={isChecked ? 'primary' : 'dashed'}
          >
            {item.value}
          </Button>
        );
      })}
    </Space>
  ));

  return (
    <Card size='small'>
      <Space direction='vertical' size='large'>
        <Space align='start'>
          <Image
            src={api.scanner.getFileImageAsPath(trackQuery.data?.filehash || '')}
            alt='track album'
            width={128}
            height={128}
            style={{ borderRadius: 8 }}
          />

          <Button onClick={() => handleListen()}>{isListening ? 'Stop' : 'Listen'}</Button>
        </Space>

        <Space direction='vertical' size='small'>
          <Typography.Text>Artist: {trackQuery.data?.metadata?.artist}</Typography.Text>

          <Typography.Text>Title: {trackQuery.data?.metadata?.title}</Typography.Text>
        </Space>

        <Space direction='vertical' size='small'>
          {categoriesRendered}
        </Space>
      </Space>
    </Card>
  );
};
