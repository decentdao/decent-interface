'use client';

import { ReactNode, useEffect } from 'react';
import Layout from '../src/components/ui/page/Layout';
import { initErrorLogging } from '../src/helpers/errorLogging';
import ProviderWrapper from '../src/providers/ProviderWrapper';
import { notProd, testErrorBoundary } from '../src/utils/dev';

function localDevConfigs() {
  if (notProd()) {
    if (process.env.NEXT_PUBLIC_TEST_ERROR_BOUNDARY === 'true') {
      testErrorBoundary();
    }
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initErrorLogging();
    localDevConfigs();
  }, []);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <link
          rel="icon"
          href="/favicon.ico"
        />

        <meta
          name="theme-color"
          content="#000000"
        />
        <meta
          name="description"
          content="Do More with DAOs. Go farther, faster. Create a hyper-scalable global organization. Fractalize risk and governance."
        />
        <meta
          name="git-hash"
          content={process.env.NEXT_PUBLIC_GIT_HASH}
        />
        <link
          rel="apple-touch-icon"
          href="/images/logo192.png"
        />
        <link
          rel="manifest"
          href="/manifest.json"
        />
        <meta
          property="og:url"
          content={process.env.NEXT_PUBLIC_SITE_URL}
        />
        <meta
          property="og:description"
          content="Do More with DAOs. Go farther, faster. Create a hyper-scalable global organization. Fractalize risk and governance."
        />
        <meta
          property="og:type"
          content="website"
        />
        <meta
          property="og:title"
          content="Fractal"
        />
        <meta
          property="og:image"
          content="https://i.imgur.com/KBVPzJC.png"
        />
        <meta
          property="og:image:alt"
          content="Fractal"
        />
        <meta
          property="og:site_name"
          content="Fractal"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Fractal</title>
      </head>
      <body>
        <ProviderWrapper>
          <Layout>{children}</Layout>
        </ProviderWrapper>
      </body>
    </html>
  );
}
