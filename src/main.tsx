import '@fontsource/space-mono';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './assets/css/Markdown.css';
import './assets/css/sentry.css';
import './assets/css/Toast.css';
import './insights';
import { runMigrations } from './hooks/utils/cache/runMigrations';
import { useSetNetworkConfig } from './providers/NetworkConfig/NetworkConfigProvider';
import { useNetworkConfigStore } from './providers/NetworkConfig/useNetworkConfigStore';
import Providers from './providers/Providers';
import { router } from './router';

function DecentRouterProvider() {
  useSetNetworkConfig();

  const { addressPrefix } = useNetworkConfigStore();
  const urlParams = new URLSearchParams(window.location.search);
  const addressWithPrefix = urlParams.get('dao');

  const prefixAndAddress = addressWithPrefix?.split(':');
  const daoAddressStr = prefixAndAddress?.[1];

  return <RouterProvider router={router(addressPrefix, daoAddressStr)} />;
}

async function initializeApp() {
  await runMigrations();

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
}

initializeApp();
