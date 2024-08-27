import Hotjar from '@hotjar/browser';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { useNetworkConfig } from './providers/NetworkConfig/NetworkConfigProvider';
import Providers from './providers/Providers';
import { router } from './router';
import '@fontsource/space-mono';
import 'react-toastify/dist/ReactToastify.min.css';
import './assets/css/Markdown.css';
import './assets/css/sentry.css';

const siteId = 5107892;
const hotjarVersion = 6;

function FractalRouterProvider() {
  const { addressPrefix } = useNetworkConfig();
  return <RouterProvider router={router(addressPrefix)} />;
}

const root = document.getElementById('root');
if (root !== null) {

  Hotjar.init(siteId, hotjarVersion);
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Providers>
        <FractalRouterProvider />
      </Providers>
    </React.StrictMode>,
  );
}
