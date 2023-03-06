import '@/client/layouts/base.css';

import { ConfigProvider } from 'antd';
import type { AppProps as NextAppProps } from 'next/app';
import { JetBrains_Mono } from 'next/font/google';
import Head from 'next/head';
import { ComponentType } from 'react';
import { ThemeProvider } from 'styled-components';

import { PublicLayout } from '@/client/layouts/PublicLayout';
import theme from '@/client/theme';
import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { WithLayout } from '@/client/types/Layout';
import { handleAdminTokenInput } from '@/client/utils/handleAdminTokenInput';

type AppProps = Omit<NextAppProps, 'Component' | 'pageProps'> & {
  Component: WithLayout<ComponentType<WithDefaultPageProps>>;
  pageProps: WithDefaultPageProps;
};

const font = JetBrains_Mono({
  weight: ['400', '600'],
  subsets: ['cyrillic'],
  display: 'auto',
  variable: '--font-name',
});

export default function MyApp({ Component, pageProps }: AppProps) {
  if (pageProps.adminSide) {
    if (!handleAdminTokenInput(pageProps.clientAdminToken)) {
      return <></>;
    }
  }

  const Layout = Component.Layout || PublicLayout;

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: font.style.fontFamily,
        },
      }}
    >
      <Head>
        <title>nesorter</title>
      </Head>

      <ThemeProvider theme={theme}>
        <Layout {...pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </ConfigProvider>
  );
}
