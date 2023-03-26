import { useStore } from '@nanostores/react';
import { Form } from 'antd';

import { AdminLayout } from '@/client/layouts/AdminLayout';
import { CreateModal } from '@/client/pages/PlaylistsPage/components/CreateModal';
import { EditModal } from '@/client/pages/PlaylistsPage/components/EditModal';
import { PlaylistsTable } from '@/client/pages/PlaylistsPage/components/PlaylistsTable';
import { StorePlaylistsPage } from '@/client/pages/PlaylistsPage/store';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

const PlaylistsPage = () => {
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  useStore(StorePlaylistsPage);

  return (
    <>
      <CreateModal createForm={createForm} />

      <EditModal createForm={createForm} editForm={editForm} />

      <PlaylistsTable editForm={editForm} />
    </>
  );
};

PlaylistsPage.Layout = AdminLayout;
PlaylistsPage.Title = 'nesorter :: playlists';
export default PlaylistsPage;
export const getServerSideProps = withDefaultPageProps();
