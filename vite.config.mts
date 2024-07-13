import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), checker({ typescript: true })],
  server: {
    port: 8888,
  },
  build: {
    sourcemap: true,
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
});
