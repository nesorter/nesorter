import { useEffect, useState } from 'react';

import { AdminLayout } from '@/client/layouts/AdminLayout';
import { withDefaultPageProps } from '@/client/utils/withDefaultPageProps';

import { api } from '../../api';
import sendMultipartFormData from '../../api/sendMultipartFormData';
import { Chain } from '../../api/types';
import { Box, Text } from '../../components';
import { DirTree } from './components/DirTree';

const UploadPage = () => {
  const [chain, setChain] = useState<Chain>({});
  const [targetFolder, setTargetFolder] = useState('');
  const [path, setPath] = useState('');
  const [newDir, setNewDir] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    if (!/^([a-zA-Z]|\d|_)*$/.test(newDir)) {
      alert('В названии новой директории допустимы только: латиница, цифры и "_"');
      return;
    }

    const form = new FormData();
    form.append('path', path);
    form.append('newDir', newDir);

    files.forEach((file, index) => {
      form.append(`file_${index}`, file);
    });

    sendMultipartFormData({
      onUploadProgress: (v) => setProgress(v),
      form: form,
      url: '/api/scanner/upload-files',
    })
      .then(() => alert('Done. Run SCAN at status page'))
      .catch(() => alert('failed'));
  };

  useEffect(() => {
    setPath(chain[targetFolder]?.path || '');
  }, [targetFolder]);

  useEffect(() => {
    api.scanner.getChain().then(setChain).catch(console.log);
  }, []);

  return (
    <Box flexDirection='column' gap={10} alignItems='flex-start'>
      <Box width='320px' maxWidth='320px'>
        <DirTree chain={chain} selected={targetFolder} onSelect={(key) => setTargetFolder(key)} />
      </Box>

      <Box gap={10} alignItems='center'>
        <Text color='#fff'>Current working directory:</Text>

        <input
          style={{ width: '480px' }}
          type='text'
          value={path}
          onInput={(ev) => setPath(ev.currentTarget.value)}
        />
      </Box>

      <Box gap={10} alignItems='center'>
        <Text color='#fff'>New directory name:</Text>

        <input
          style={{ width: '240px' }}
          type='text'
          value={newDir}
          onInput={(ev) => setNewDir(ev.currentTarget.value)}
        />
      </Box>

      <Box gap={10} alignItems='center'>
        <Text color='#fff'>Files (mp3):</Text>

        <Text color='#fff'>
          <input
            style={{ width: '240px' }}
            type='file'
            multiple
            onInput={(ev) => setFiles([...(ev.currentTarget.files || [])])}
          />
        </Text>
      </Box>

      <button onClick={handleUpload}>Upload</button>

      <Text color='#fff'>Upload Progress: {progress}%</Text>
    </Box>
  );
};

UploadPage.Layout = AdminLayout;
export default UploadPage;
export const getServerSideProps = withDefaultPageProps(() => Promise.resolve({ props: {} }));
