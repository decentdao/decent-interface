import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { WagmiProvider } from 'wagmi';
import { theme } from '../assets/theme';
import { ErrorBoundary } from '../components/ui/utils/ErrorBoundary';
import { TopErrorFallback } from '../components/ui/utils/TopErrorFallback';
import graphQLClient from '../graphql';
import { useMigrate } from '../hooks/utils/cache/useMigrate';
import { AppProvider } from './App/AppProvider';
import EthersContextProvider from './Ethers';
import { NetworkConfigProvider } from './NetworkConfig/NetworkConfigProvider';
import { wagmiConfig, queryClient } from './NetworkConfig/web3-modal.config';

export default function Providers({ children }: { children: ReactNode }) {
  useMigrate();

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
                    <Toaster />
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
