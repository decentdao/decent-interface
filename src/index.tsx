import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import reportWebVitals from './reportWebVitals';
import { BlockchainDataProvider } from './contexts/blockchainData';
import App from './App';
import { Web3Provider } from './contexts/web3Data/Web3Provider';
import { FractalProvider } from './providers/fractal/FractalProvider';

const container = document.getElementById('root');
const root = createRoot(container!);
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Helmet>
          <title>Fractal</title>
        </Helmet>
        <HashRouter>
          <Web3Provider>
            <BlockchainDataProvider>
              <FractalProvider>
                <ToastContainer
                  position="bottom-center"
                  closeButton={false}
                  newestOnTop={false}
                  pauseOnFocusLoss={false}
                  toastClassName="mt-2 bottom-0 mb-0 font-sans font-medium shadow bg-gray-400 text-gray-25 text-center cursor-pointer"
                  progressClassName="bg-none bg-gold-500"
                />
                <App />
              </FractalProvider>
            </BlockchainDataProvider>
          </Web3Provider>
        </HashRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
