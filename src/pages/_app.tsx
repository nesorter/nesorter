import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { ThemeProvider } from 'styled-components';

import { PageWrapper } from '@/client/components/PageWrapper';
import theme from '@/client/theme';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('nesorter-admin-token');
  } else {
    return 'serverui';
  }
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const [token, setToken] = useState(getToken());

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
        <title>nesorter</title>

        <link href='/fonts/iosevka-ss07.css' rel='stylesheet' />

        <style
          dangerouslySetInnerHTML={{
            __html: 'body{ margin: 0; padding: 0 } * { font-family: "Iosevka SS07 Web" }',
          }}
        />
      </Head>

      <ThemeProvider theme={theme}>
        <PageWrapper>
          <Component {...pageProps} />
        </PageWrapper>
      </ThemeProvider>
    </>
  );
}
