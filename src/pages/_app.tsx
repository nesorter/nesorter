import type { AppProps } from 'next/app';
import { Head } from 'next/head';
import { useState } from 'react';
import { ThemeProvider } from 'styled-components';

import { PageWrapper } from '@/client/components/PageWrapper';
import theme from '@/client/theme';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [token, setToken] = useState(localStorage.getItem('nesorter-admin-token'));

  if (!token && typeof window !== 'undefined') {
    const newToken = prompt('Введи admin token, ибо его нет');

    setToken(newToken);
    localStorage.setItem('nesorter-admin-token', newToken as string);
    location.reload();
  }

  if (!token) {
    return <></>;
  }

  return (
    <>
      <Head>
        <link href='/fonts/iosevka-ss07.css' rel='stylesheet' />
      </Head>

      <ThemeProvider theme={theme}>
        <PageWrapper>
          <Component {...pageProps} />
        </PageWrapper>
      </ThemeProvider>
    </>
  );
}
