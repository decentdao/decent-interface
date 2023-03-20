import { ColorModeScript } from '@chakra-ui/react';
import { Html, Main, Head, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  const noOverlayWorkaroundScript = `
    window.addEventListener('error', event => {
      event.stopImmediatePropagation()
    })

    window.addEventListener('unhandledrejection', event => {
      event.stopImmediatePropagation()
    })
  `;
  // Yessir - this sucks. See https://github.com/vercel/next.js/discussions/13387
  // The reason for using this is that ChakraUI + Next.js v13 doesn't work really well in terms of SSR.
  // This should get better with Next.js v14 - when app/ directory will become part of core API and ChakraUI folks would support that.
  return (
    <Html>
      <Head>
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
        {process.env.NODE_ENV !== 'production' && (
          <Script
            strategy="beforeInteractive"
            id="disable-nextjs-error-popup"
            dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}
          />
        )}
      </Head>
      <body>
        {/* Make Color mode to persists when you refresh the page. */}
        <ColorModeScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
