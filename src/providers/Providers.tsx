import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';
import { theme } from '../assets/theme';
import { ModalProvider } from '../components/ui/modals/ModalProvider';
import { ErrorFallback } from '../components/ui/utils/ErrorFallback';
import graphQLClient from '../graphql';
import { FractalErrorBoundary, initErrorLogging } from '../helpers/errorLogging';
import { AppProvider } from './App/AppProvider';
import EthersContextProvider from './Ethers';
import { NetworkConfigProvider } from './NetworkConfig/NetworkConfigProvider';
import { wagmiConfig, chains, walletConnectProjectId } from './NetworkConfig/web3-modal.config';

if (walletConnectProjectId) {
  createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId, chains });
}

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
            <NetworkConfigProvider>
              <EthersContextProvider>
                <AppProvider>
                  <ToastContainer
                    position="bottom-center"
                    closeButton={false}
                    newestOnTop={false}
                    pauseOnFocusLoss={false}
                  />
                  <ModalProvider>{children}</ModalProvider>
                </AppProvider>
              </EthersContextProvider>
            </NetworkConfigProvider>
          </WagmiConfig>
        </ApolloProvider>
      </FractalErrorBoundary>
    </ChakraProvider>
  );
}
