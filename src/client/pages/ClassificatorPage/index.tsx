import { useStore } from '@nanostores/react';
import { Space } from 'antd';
import React from 'react';

import { api } from '@/client/api';
import { AdminLayout } from '@/client/layouts/AdminLayout';
import { StoreClassifyPage } from '@/client/pages/ClassificatorPage/store';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

import { ClassEditor } from './components/ClassEditor';
import { ClassEditorWrapper } from './components/ClassEditorWrapper';
import { ClassEditPane } from './components/ClassEditPane';
import { LibraryExplorerPane } from './components/LibraryExplorerPane';
import { SelectedTrack } from './components/SelectedTrack';
import { SelectedTrackWrapper } from './components/SelectedTrackWrapper';
import { SelectTrackMessage } from './components/SelectTrackMessage';

const ClassificatorPage = () => {
  const { classEditMode } = useStore(StoreClassifyPage);

  return (
    <Space size='large' align='start'>
      <Space size='large' direction='vertical'>
        <ClassEditPane />

        <LibraryExplorerPane />
      </Space>

      {classEditMode && (
        <ClassEditorWrapper>
          <ClassEditor />
        </ClassEditorWrapper>
      )}

      {!classEditMode && (
        <SelectedTrackWrapper>
          <SelectTrackMessage />

          <SelectedTrack />
        </SelectedTrackWrapper>
      )}
    </Space>
  );
};

ClassificatorPage.Layout = AdminLayout;
ClassificatorPage.Title = 'nesorter :: classificator';
export default ClassificatorPage;
export const getServerSideProps = withDefaultPageProps(async () => {
  const catalogs = await api.categories.get().then((_) => _.data);

  return {
    props: {
      catalogs,
    },
  };
});
