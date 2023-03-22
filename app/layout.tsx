'use client';

import { ApolloProvider } from '@apollo/client';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { midnightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';
import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-sans';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from '../src/assets/theme';
import { ModalProvider } from '../src/components/ui/modals/ModalProvider';
import Layout from '../src/components/ui/page/Layout';
import { ErrorFallback } from '../src/components/ui/utils/ErrorFallback';
import graphQLClient from '../src/graphql';
import { FractalErrorBoundary, initErrorLogging } from '../src/helpers/errorLogging';
import { FractalProvider } from '../src/providers/Fractal/FractalProvider';
import { NetworkConfigProvider } from '../src/providers/NetworkConfig/NetworkConfigProvider';
import { chains, wagmiClient } from '../src/providers/NetworkConfig/rainbow-kit.config';
import { notProd, testErrorBoundary } from '../src/utils/dev';
import '../src/i18n';

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
        <CacheProvider>
          <ChakraProvider theme={theme}>
            <FractalErrorBoundary fallback={<ErrorFallback />}>
              <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider
                  chains={chains}
                  modalSize="compact"
                  theme={midnightTheme()}
                >
                  <NetworkConfigProvider>
                    <ApolloProvider client={graphQLClient}>
                      <FractalProvider>
                        <ToastContainer
                          position="bottom-center"
                          closeButton={false}
                          newestOnTop={false}
                          pauseOnFocusLoss={false}
                        />
                        <ModalProvider>
                          <Layout>{children}</Layout>
                        </ModalProvider>
                      </FractalProvider>
                    </ApolloProvider>
                  </NetworkConfigProvider>
                </RainbowKitProvider>
              </WagmiConfig>
            </FractalErrorBoundary>
          </ChakraProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
