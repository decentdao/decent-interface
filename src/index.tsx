import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-sans';
import App from './App';
import { theme } from './assets/theme';
import { ErrorFallback } from './components/ErrorFallback';
import { BlockchainDataProvider } from './contexts/blockchainData';
import { Web3Provider } from './contexts/web3Data/Web3Provider';
import { FractalErrorBoundary, initErrorLogging } from './helpers/errorLogging';
import { ModalProvider } from './components/modals/ModalProvider';
import { NetworkConfigProvider } from './providers/NetworkConfig/NetworkConfigProvider';
import { FractalProvider } from './providers/fractal/FractalProvider';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = createRoot(container!);
const queryClient = new QueryClient();

initErrorLogging();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Helmet>
          <title>Fractal</title>
        </Helmet>
        <HashRouter>
          <FractalErrorBoundary fallback={ErrorFallback}>
            <ChakraProvider theme={theme}>
              <Web3Provider>
                <NetworkConfigProvider>
                  <BlockchainDataProvider>
                    <FractalProvider>
                      <ToastContainer
                        position="bottom-center"
                        closeButton={false}
                        newestOnTop={false}
                        pauseOnFocusLoss={false}
                      />
                      <ModalProvider>
                        <App />
                      </ModalProvider>
                    </FractalProvider>
                  </BlockchainDataProvider>
                </NetworkConfigProvider>
              </Web3Provider>
            </ChakraProvider>
          </FractalErrorBoundary>
        </HashRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
