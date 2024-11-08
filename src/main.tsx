import '@fontsource/space-mono';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './assets/css/Markdown.css';
import './assets/css/sentry.css';
import './assets/css/Toast.css';
import './insights';
import { useNetworkConfig } from './providers/NetworkConfig/NetworkConfigProvider';
import Providers from './providers/Providers';
import { router } from './router';

function DecentRouterProvider() {
  const { addressPrefix } = useNetworkConfig();
  const urlParams = new URLSearchParams(window.location.search);
  const addressWithPrefix = urlParams.get('dao');

  const prefixAndAddress = addressWithPrefix?.split(':');
  const daoAddressStr = prefixAndAddress?.[1];

  return <RouterProvider router={router(addressPrefix, daoAddressStr)} />;
}

const root = document.getElementById('root');
if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Providers>
        <DecentRouterProvider />
      </Providers>
    </React.StrictMode>,
  );
}
