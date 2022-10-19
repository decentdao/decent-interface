import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'react-toastify/dist/ReactToastify.css';
import reportWebVitals from './reportWebVitals';
import { BlockchainDataProvider } from './contexts/blockchainData';
import App from './App';
import { Web3Provider } from './contexts/web3Data/Web3Provider';
import { FractalProvider } from './providers/fractal/FractalProvider';
import { ErrorFallback } from './components/ErrorFallback';
import { FractalErrorBoundary, initErrorLogging } from './helpers/errorLogging';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './assets/theme';

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
                <BlockchainDataProvider>
                  <FractalProvider>
                    <ToastContainer
                      position="bottom-center"
                      closeButton={false}
                      newestOnTop={false}
                      pauseOnFocusLoss={false}
                    />
                    <App />
                  </FractalProvider>
                </BlockchainDataProvider>
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
