import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { midnightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';
import { theme } from '../src/assets/theme';
import { ModalProvider } from '../src/components/ui/modals/ModalProvider';
import Layout from '../src/components/ui/page/Layout';
import { ErrorFallback } from '../src/components/ui/utils/ErrorFallback';
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

export default function App({ Component, pageProps }: AppProps) {
  localDevConfigs();
  useEffect(() => {
    initErrorLogging();
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Fractal</title>
      </Head>
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
                  <FractalProvider>
                    <ToastContainer
                      position="bottom-center"
                      closeButton={false}
                      newestOnTop={false}
                      pauseOnFocusLoss={false}
                    />
                    <ModalProvider>
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </ModalProvider>
                  </FractalProvider>
                </NetworkConfigProvider>
              </RainbowKitProvider>
            </WagmiConfig>
          </FractalErrorBoundary>
        </ChakraProvider>
      </CacheProvider>
    </>
  );
}
