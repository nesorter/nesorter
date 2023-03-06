import type { AppProps as NextAppProps } from 'next/app';
import Head from 'next/head';
import { ComponentType } from 'react';
import { ThemeProvider } from 'styled-components';

import { PageWrapper } from '@/client/components/PageWrapper';
import theme from '@/client/theme';
import { WithDefaultProps } from '@/utils/withDefaultProps';

type AppProps<P = Record<string, unknown>> = Omit<NextAppProps, 'Component' | 'pageProps'> & {
  Component: ComponentType<WithDefaultProps<P>>;
  pageProps: WithDefaultProps<P>;
};

export default function MyApp({ Component, pageProps }: AppProps) {
  if (!pageProps.clientAdminToken && typeof window !== 'undefined') {
    const newToken = localStorage.getItem('nesorter-admin-token') || prompt('Input ADMIN_TOKEN 🤔');

    localStorage.setItem('nesorter-admin-token', newToken as string);
    document.cookie = `nesorter-admin-token=${newToken}; path=/; max-age=${60 * 60 * 24 * 14};`;
    location.reload();
  }

  if (!pageProps.clientAdminToken) {
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
