'use client';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { RainbowKitProvider, midnightTheme } from '@rainbow-me/rainbowkit';
import { ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';
import { theme } from '../assets/theme';
import { ModalProvider } from '../components/ui/modals/ModalProvider';
import Layout from '../components/ui/page/Layout';
import { ErrorFallback } from '../components/ui/utils/ErrorFallback';
import graphQLClient from '../graphql';
import { FractalErrorBoundary, initErrorLogging } from '../helpers/errorLogging';
import { AppProvider } from './App/AppProvider';
import EthersContextProvider from './Ethers';
import { NetworkConfigProvider } from './NetworkConfig/NetworkConfigProvider';
import { wagmiConfig, chains } from './NetworkConfig/rainbow-kit.config';
import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-sans';
import 'react-toastify/dist/ReactToastify.min.css';
export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    initErrorLogging();
  }, []);

  return (
    <ChakraProvider
      theme={theme}
      resetCSS
    >
      <FractalErrorBoundary fallback={<ErrorFallback />}>
        <ApolloProvider client={graphQLClient}>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider
              chains={chains}
              modalSize="compact"
              theme={midnightTheme()}
            >
              <NetworkConfigProvider>
                <EthersContextProvider>
                  <AppProvider>
                    <ToastContainer
                      position="bottom-center"
                      closeButton={false}
                      newestOnTop={false}
                      pauseOnFocusLoss={false}
                    />
                    <ModalProvider>
                      <Layout>{children}</Layout>
                    </ModalProvider>
                  </AppProvider>
                </EthersContextProvider>
              </NetworkConfigProvider>
            </RainbowKitProvider>
          </WagmiConfig>
        </ApolloProvider>
      </FractalErrorBoundary>
    </ChakraProvider>
  );
}
