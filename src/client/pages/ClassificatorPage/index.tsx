import { useStore } from '@nanostores/react';
import { Form, Space } from 'antd';
import React from 'react';

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
  const [editCategoryForm] = Form.useForm();
  const { classEditMode, categoriesFetch } = useStore(StoreClassifyPage);

  if (categoriesFetch) {
    return null;
  }

  return (
    <Space size='large' align='start'>
      <Space size='large' direction='vertical'>
        <ClassEditPane />

        <LibraryExplorerPane />
      </Space>

      {classEditMode && (
        <ClassEditorWrapper>
          <ClassEditor editCategoryForm={editCategoryForm} />
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
export const getServerSideProps = withDefaultPageProps();
