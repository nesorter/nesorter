import '@/client/layouts/base.css';

import { ConfigProvider } from 'antd';
import type { AppProps as NextAppProps } from 'next/app';
import { JetBrains_Mono } from 'next/font/google';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ComponentType, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { PublicLayout } from '@/client/layouts/PublicLayout';
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
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  useEffect(() => {
    const run = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('serviceworker.js', {
            scope: './',
          });
          if (registration.installing) {
            console.log('Service worker installing');
          } else if (registration.waiting) {
            console.log('Service worker installed');
          } else if (registration.active) {
            console.log('Service worker active');
          }
        } catch (error) {
          console.error(`Registration failed with ${error}`);
        }
      }
    };

    run().catch(console.error);
  }, []);

  if (pageProps.adminSide) {
    if (!handleAdminTokenInput(pageProps.clientAdminToken)) {
      if (typeof window !== 'undefined') {
        router.push('/admin/login').catch(console.error);
      }

      return <></>;
    }
  }

  const Layout = Component.Layout || PublicLayout;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: font.style.fontFamily,
          },
        }}
      >
        <Head>
          <title>nesorter</title>

          <link rel='manifest' href='/nesorter.webmanifest' />

          <link rel='icon' href='/favicon.svg' />
        </Head>

        <Layout {...pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
