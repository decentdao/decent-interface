import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';
import { checker } from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd(), 'SENTRY_');
  return {
    plugins: [
      nodePolyfills(),
      react(),
      checker({ typescript: true }),
      // sentryVitePlugin({
      //   org: env.SENTRY_ORG,
      //   project: env.SENTRY_PROJECT,
      //   authToken: env.SENTRY_AUTH_TOKEN,
      //   release: {
      //     create: true,
      //     setCommits: {
      //       auto: true,
      //     },
      //   },
      // }),
    ],

    server: {
      port: 3000,
    },

    // build: {
    //   sourcemap: true,
    // },
  };
});
