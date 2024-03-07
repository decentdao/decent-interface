import { AppProps } from 'next/app';
import Head from 'next/head';
import { APP_NAME } from '../constants/common';
import Providers from '../providers/Providers';
import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-sans';
import 'react-toastify/dist/ReactToastify.min.css';
import '../assets/css/SnapshotProposalMarkdown.css';
import DAOController from './DAOController';
export default function AppRoot({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
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
      </Head>
      <Providers>
        <DAOController>
          <Component {...pageProps} />
        </DAOController>
      </Providers>
    </div>
  );
}
