import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { WagmiProvider } from 'wagmi';
import { theme } from '../assets/theme';
import { TopErrorFallback } from '../components/ui/utils/TopErrorFallback';
import graphQLClient from '../graphql';
import { ErrorBoundary } from '../helpers/errorLogging';
import { AppProvider } from './App/AppProvider';
import EthersContextProvider from './Ethers';
import { NetworkConfigProvider } from './NetworkConfig/NetworkConfigProvider';
import { wagmiConfig, queryClient } from './NetworkConfig/web3-modal.config';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider
      theme={theme}
      resetCSS
    >
      <ErrorBoundary
        fallback={<TopErrorFallback />}
        showDialog
      >
        <ApolloProvider client={graphQLClient}>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <NetworkConfigProvider>
                <EthersContextProvider>
                  <AppProvider>
                    <ToastContainer
                      position="bottom-center"
                      closeButton={false}
                      newestOnTop={false}
                      pauseOnFocusLoss={false}
                    />
                    {children}
                  </AppProvider>
                </EthersContextProvider>
              </NetworkConfigProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ApolloProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
}
