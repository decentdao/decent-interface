import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import './index.css';
import reportWebVitals from './reportWebVitals';
import { BlockchainDataProvider } from './contexts/blockchainData';
import App from './App';
import { Web3Provider } from './contexts/web3Data/Web3Provider';
import { FractalProvider } from './providers/fractal/FractalProvider';
import { ErrorFallback } from './components/ErrorFallback';

const container = document.getElementById('root');
const root = createRoot(container!);

// Used for remote error reporting
// https://sentry.io/organizations/decent-mg/issues/
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN || '',
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        <title>Fractal</title>
      </Helmet>
      <HashRouter>
        <Sentry.ErrorBoundary fallback={ErrorFallback}>
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
        </Sentry.ErrorBoundary>
      </HashRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
