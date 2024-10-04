import './insights';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { useNetworkConfig } from './providers/NetworkConfig/NetworkConfigProvider';
import Providers from './providers/Providers';
import { router } from './router';
import '@fontsource/space-mono';
import './assets/css/Markdown.css';
import './assets/css/sentry.css';

function FractalRouterProvider() {
  const { addressPrefix } = useNetworkConfig();
  return <RouterProvider router={router(addressPrefix)} />;
}

const root = document.getElementById('root');
if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Providers>
        <FractalRouterProvider />
      </Providers>
    </React.StrictMode>,
  );
}
