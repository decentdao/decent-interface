import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import { RainbowKitProvider, midnightTheme } from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';
import { ModalProvider } from '../components/ui/modals/ModalProvider';
import { ErrorFallback } from '../components/ui/utils/ErrorFallback';
import graphQLClient from '../graphql';
import { FractalErrorBoundary } from '../helpers/errorLogging';
import { AppProvider } from './App/AppProvider';
import { NetworkConfigProvider } from './NetworkConfig/NetworkConfigProvider';
import { wagmiClient, chains } from './NetworkConfig/rainbow-kit.config';
import '../i18n';
import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-sans';
import 'react-toastify/dist/ReactToastify.min.css';

function ProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider
      theme={theme}
      resetCSS
    >
      <WagmiConfig client={wagmiClient}>
        <NetworkConfigProvider>
          <RainbowKitProvider
            chains={chains}
            modalSize="compact"
            theme={midnightTheme()}
          >
            <AppProvider>
              <ToastContainer
                position="bottom-center"
                closeButton={false}
                newestOnTop={false}
                pauseOnFocusLoss={false}
              />
              <FractalErrorBoundary fallback={<ErrorFallback />}>
                <ApolloProvider client={graphQLClient}>
                  <ModalProvider>{children}</ModalProvider>
                </ApolloProvider>
              </FractalErrorBoundary>
            </AppProvider>
          </RainbowKitProvider>
        </NetworkConfigProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default ProviderWrapper;
