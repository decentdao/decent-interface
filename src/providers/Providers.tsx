import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { RainbowKitProvider, midnightTheme } from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';
import { theme } from '../assets/theme';
import { ErrorFallback } from '../components/ui/utils/ErrorFallback';
import graphQLClient from '../graphql';
import { FractalErrorBoundary } from '../helpers/errorLogging';
import { AppProvider } from './App/AppProvider';
import EthersContextProvider from './Ethers';
import { NetworkConfigProvider } from './NetworkConfig/NetworkConfigProvider';
import { wagmiConfig, chains } from './NetworkConfig/rainbow-kit.config';

export default function Providers({ children }: { children: ReactNode }) {
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
                    {children}
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
