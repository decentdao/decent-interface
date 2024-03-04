import 'i18next';
import { ReactNode } from 'react';
import { APP_NAME } from '../src/constants/common';
import Providers from '../src/providers/Providers';

export default function RootLayout({ children }: { children: ReactNode }) {
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
          content="#181716"
        />
        <meta
          name="description"
          content="Are you outgrowing your Multisig? Fractal extends Safe treasuries into on-chain hierarchies of permissions, token flows, and governance."
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
          content="Are you outgrowing your Multisig? Fractal extends Safe treasuries into on-chain hierarchies of permissions, token flows, and governance."
        />
        <meta
          property="og:type"
          content="website"
        />
        <meta
          property="og:title"
          content={APP_NAME}
        />
        <meta
          property="og:image"
          content="https://app.fractalframework.xyz/images/hero_image.png"
        />
        <meta
          property="og:image:alt"
          content={APP_NAME}
        />
        <meta
          property="og:site_name"
          content={APP_NAME}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{APP_NAME}</title>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
