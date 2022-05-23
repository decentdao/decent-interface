import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { CookiesProvider } from 'react-cookie';

import './index.css';
import reportWebVitals from './reportWebVitals';
import { Web3Provider } from './contexts/web3Data';
import { BlockchainDataProvider } from './contexts/blockchainData';
import { DAODataProvider } from './contexts/daoData';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <HelmetProvider>
        <Helmet>
          <title>Fractal</title>
        </Helmet>
        <HashRouter>
          <Web3Provider>
            <BlockchainDataProvider>
              <DAODataProvider>
                <ToastContainer
                  position="bottom-center"
                  closeButton={false}
                  newestOnTop={false}
                  pauseOnFocusLoss={false}
                  toastClassName="mt-2 bottom-0 mb-0 font-sans font-medium shadow bg-gray-400 text-gray-25 text-center cursor-pointer"
                  progressClassName="bg-none bg-gold-500"
                />
                <App />
              </DAODataProvider>
            </BlockchainDataProvider>
          </Web3Provider>
        </HashRouter>
      </HelmetProvider>
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
