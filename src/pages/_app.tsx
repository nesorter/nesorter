import type { AppProps as NextAppProps } from 'next/app';
import Head from 'next/head';
import { ComponentType } from 'react';
import { ThemeProvider } from 'styled-components';

import { PageWrapper } from '@/client/components/PageWrapper';
import theme from '@/client/theme';
import { WithDefaultPageProps } from '@/types/DefaultPageProps';
import { WithLayout } from '@/types/Layout';
import { handleAdminTokenInput } from '@/utils/handleAdminTokenInput';

type AppProps = Omit<NextAppProps, 'Component' | 'pageProps'> & {
  Component: WithLayout<ComponentType<WithDefaultPageProps>>;
  pageProps: WithDefaultPageProps;
};

export default function MyApp({ Component, pageProps }: AppProps) {
  if (pageProps.adminSide) {
    if (!handleAdminTokenInput(pageProps.clientAdminToken)) {
      return <></>;
    }
  }

  const Layout = Component.Layout || PageWrapper;

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
        <Layout {...pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}
