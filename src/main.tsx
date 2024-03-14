import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import Providers from './providers/Providers';
import { router } from './router';

import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-sans';
import 'react-toastify/dist/ReactToastify.min.css';
import './assets/css/Markdown.css';

const root = document.getElementById('root');
if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </React.StrictMode>,
  );
}
