'use client';

import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-sans';
import { midnightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import 'i18next';
import { ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { WagmiConfig } from 'wagmi';
import { ModalProvider } from '../src/components/ui/modals/ModalProvider';
import Layout from '../src/components/ui/page/Layout';
import { ErrorFallback } from '../src/components/ui/utils/ErrorFallback';
import { APP_NAME } from '../src/constants/common';
import graphQLClient from '../src/graphql';
import { FractalErrorBoundary, initErrorLogging } from '../src/helpers/errorLogging';
import { AppProvider } from '../src/providers/App/AppProvider';
import { NetworkConfigProvider } from '../src/providers/NetworkConfig/NetworkConfigProvider';
import { chains, wagmiClient } from '../src/providers/NetworkConfig/rainbow-kit.config';

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initErrorLogging();
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
          content="#181716"
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
          content={APP_NAME}
        />
        <meta
          property="og:image"
          content="https://i.imgur.com/KBVPzJC.png"
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
        <ChakraProvider
          theme={theme}
          resetCSS
        >
          <FractalErrorBoundary fallback={<ErrorFallback />}>
            <WagmiConfig client={wagmiClient}>
              <RainbowKitProvider
                chains={chains}
                modalSize="compact"
                theme={midnightTheme()}
              >
                <NetworkConfigProvider>
                  <AppProvider>
                    <ToastContainer
                      position="bottom-center"
                      closeButton={false}
                      newestOnTop={false}
                      pauseOnFocusLoss={false}
                    />
                    <ApolloProvider client={graphQLClient}>
                      <ModalProvider>
                        <Layout>{children}</Layout>
                      </ModalProvider>
                    </ApolloProvider>
                  </AppProvider>
                </NetworkConfigProvider>
              </RainbowKitProvider>
            </WagmiConfig>
          </FractalErrorBoundary>
        </ChakraProvider>
      </body>
    </html>
  );
}
