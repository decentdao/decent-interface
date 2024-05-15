import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills(), react(), checker({ typescript: true })],
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
});
