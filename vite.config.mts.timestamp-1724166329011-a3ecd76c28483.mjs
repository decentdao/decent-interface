// vite.config.mts
import react from "file:///Users/epicbadtiming/Projects/Fractal/fractal-interface/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { defineConfig } from "file:///Users/epicbadtiming/Projects/Fractal/fractal-interface/node_modules/vite/dist/node/index.js";
import { checker } from "file:///Users/epicbadtiming/Projects/Fractal/fractal-interface/node_modules/vite-plugin-checker/dist/esm/main.js";

// package.json
var package_default = {
  name: "decent-interface",
  version: "0.2.12",
  private: true,
  dependencies: {
    "@apollo/client": "^3.7.10",
    "@chakra-ui/anatomy": "^2.2.2",
    "@chakra-ui/react": "^2.8.2",
    "@chakra-ui/theme-tools": "^2.1.2",
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@ethersproject/abstract-signer": "^5.7.0",
    "@ethersproject/providers": "^5.7.2",
    "@fontsource/space-mono": "^5.0.19",
    "@fractal-framework/fractal-contracts": "^0.8.1",
    "@graphprotocol/client-apollo": "^1.0.16",
    "@hatsprotocol/sdk-v1-core": "^0.9.0",
    "@hatsprotocol/sdk-v1-subgraph": "^1.0.0",
    "@lido-sdk/contracts": "^3.0.2",
    "@netlify/blobs": "^6.5.0",
    "@netlify/functions": "^2.6.0",
    "@phosphor-icons/react": "^2.1.4",
    "@safe-global/api-kit": "^2.4.2",
    "@safe-global/safe-core-sdk-types": "^5.0.2",
    "@safe-global/safe-deployments": "^1.34.0",
    "@sentry/react": "^8.7.0",
    "@shutter-network/shutter-crypto": "^1.0.1",
    "@snapshot-labs/snapshot.js": "^0.7.3",
    "@tanstack/react-query": "^5.36.2",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "@web3modal/wagmi": "^4.2.3",
    axios: "^0.27.2",
    blo: "^1.2.0",
    classnames: "^2.3.1",
    "date-fns": "^2.29.3",
    "date-fns-tz": "^2.0.1",
    ethers: "^5.7.2",
    "evm-proxy-detection": "^1.1.0",
    formik: "^2.2.9",
    "framer-motion": "^6.5.1",
    graphql: "^16.6.0",
    i18next: "^23.10.1",
    "i18next-browser-languagedetector": "^6.1.5",
    "js-big-decimal": "^1.3.12",
    "lodash.camelcase": "^4.3.0",
    "lodash.debounce": "^4.0.8",
    "lodash.groupby": "^4.6.0",
    "lodash.isequal": "^4.5.0",
    moralis: "^2.27.1",
    react: "^18.2.0",
    "react-calendar": "^5.0.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^13.5.0",
    "react-idle-timer": "^5.5.3",
    "react-image": "^4.0.3",
    "react-markdown": "^9.0.0",
    "react-router-dom": "^6.22.0",
    "react-toastify": "^9.0.8",
    "remark-gfm": "^4.0.0",
    viem: "^2.13.1",
    vite: "^5.1.0",
    "vite-plugin-checker": "^0.6.4",
    wagmi: "^2.9.7",
    yup: "^1",
    zustand: "^4.5.2"
  },
  scripts: {
    lint: "eslint . --ext .ts,.tsx --fix",
    "lint:check": "eslint . --ext .ts,.tsx",
    pretty: "prettier . --write",
    "pretty:check": "prettier . --check",
    dev: "vite --force",
    "dev:netlify": "netlify dev",
    start: "vite start",
    preview: "vite preview",
    build: "NODE_OPTIONS=--max-old-space-size=8192 vite build",
    "graphql:build": "graphclient build",
    "graphql:dev-server": "graphclient serve-dev",
    test: "vitest --dir=test",
    postinstall: "npm run graphql:build"
  },
  engines: {
    node: "20.12.0",
    npm: "10.5.0"
  },
  browserslist: {
    production: [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    development: [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  devDependencies: {
    "@graphprotocol/client-cli": "^2.2.20",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^14.2.1",
    "@types/lodash.camelcase": "^4.3.9",
    "@types/lodash.debounce": "^4.0.9",
    "@types/lodash.groupby": "^4.6.9",
    "@types/lodash.isequal": "^4.5.8",
    "@types/react": "^18.0.17",
    "@types/react-dom": "^18.0.6",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@vitejs/plugin-react": "^4.2.1",
    encoding: "^0.1.13",
    eslint: "^8.22.0",
    "eslint-config-airbnb-typescript": "^17.1.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    jsdom: "^24.0.0",
    "netlify-cli": "^17.33.3",
    prettier: "^3.2.5",
    typescript: "^5.3.3",
    url: "^0.11.0",
    vitest: "^1.2.2"
  }
};

// vite.config.mts
var vite_config_default = defineConfig({
  plugins: [react(), checker({ typescript: true })],
  server: {
    port: 3e3
  },
  build: {
    sourcemap: true
  },
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(package_default.version)
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgInBhY2thZ2UuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9lcGljYmFkdGltaW5nL1Byb2plY3RzL0ZyYWN0YWwvZnJhY3RhbC1pbnRlcmZhY2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9lcGljYmFkdGltaW5nL1Byb2plY3RzL0ZyYWN0YWwvZnJhY3RhbC1pbnRlcmZhY2Uvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9lcGljYmFkdGltaW5nL1Byb2plY3RzL0ZyYWN0YWwvZnJhY3RhbC1pbnRlcmZhY2Uvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNoZWNrZXIgfSBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJztcbmltcG9ydCBwYWNrYWdlSnNvbiBmcm9tICcuL3BhY2thZ2UuanNvbic7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgY2hlY2tlcih7IHR5cGVzY3JpcHQ6IHRydWUgfSldLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICB9LFxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgJ2ltcG9ydC5tZXRhLmVudi5QQUNLQUdFX1ZFUlNJT04nOiBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbi52ZXJzaW9uKSxcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiZGVjZW50LWludGVyZmFjZVwiLFxuICBcInZlcnNpb25cIjogXCIwLjIuMTJcIixcbiAgXCJwcml2YXRlXCI6IHRydWUsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBhcG9sbG8vY2xpZW50XCI6IFwiXjMuNy4xMFwiLFxuICAgIFwiQGNoYWtyYS11aS9hbmF0b215XCI6IFwiXjIuMi4yXCIsXG4gICAgXCJAY2hha3JhLXVpL3JlYWN0XCI6IFwiXjIuOC4yXCIsXG4gICAgXCJAY2hha3JhLXVpL3RoZW1lLXRvb2xzXCI6IFwiXjIuMS4yXCIsXG4gICAgXCJAZW1vdGlvbi9yZWFjdFwiOiBcIl4xMS4xMC42XCIsXG4gICAgXCJAZW1vdGlvbi9zdHlsZWRcIjogXCJeMTEuMTAuNlwiLFxuICAgIFwiQGV0aGVyc3Byb2plY3QvYWJzdHJhY3Qtc2lnbmVyXCI6IFwiXjUuNy4wXCIsXG4gICAgXCJAZXRoZXJzcHJvamVjdC9wcm92aWRlcnNcIjogXCJeNS43LjJcIixcbiAgICBcIkBmb250c291cmNlL3NwYWNlLW1vbm9cIjogXCJeNS4wLjE5XCIsXG4gICAgXCJAZnJhY3RhbC1mcmFtZXdvcmsvZnJhY3RhbC1jb250cmFjdHNcIjogXCJeMC44LjFcIixcbiAgICBcIkBncmFwaHByb3RvY29sL2NsaWVudC1hcG9sbG9cIjogXCJeMS4wLjE2XCIsXG4gICAgXCJAaGF0c3Byb3RvY29sL3Nkay12MS1jb3JlXCI6IFwiXjAuOS4wXCIsXG4gICAgXCJAaGF0c3Byb3RvY29sL3Nkay12MS1zdWJncmFwaFwiOiBcIl4xLjAuMFwiLFxuICAgIFwiQGxpZG8tc2RrL2NvbnRyYWN0c1wiOiBcIl4zLjAuMlwiLFxuICAgIFwiQG5ldGxpZnkvYmxvYnNcIjogXCJeNi41LjBcIixcbiAgICBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiOiBcIl4yLjYuMFwiLFxuICAgIFwiQHBob3NwaG9yLWljb25zL3JlYWN0XCI6IFwiXjIuMS40XCIsXG4gICAgXCJAc2FmZS1nbG9iYWwvYXBpLWtpdFwiOiBcIl4yLjQuMlwiLFxuICAgIFwiQHNhZmUtZ2xvYmFsL3NhZmUtY29yZS1zZGstdHlwZXNcIjogXCJeNS4wLjJcIixcbiAgICBcIkBzYWZlLWdsb2JhbC9zYWZlLWRlcGxveW1lbnRzXCI6IFwiXjEuMzQuMFwiLFxuICAgIFwiQHNlbnRyeS9yZWFjdFwiOiBcIl44LjcuMFwiLFxuICAgIFwiQHNodXR0ZXItbmV0d29yay9zaHV0dGVyLWNyeXB0b1wiOiBcIl4xLjAuMVwiLFxuICAgIFwiQHNuYXBzaG90LWxhYnMvc25hcHNob3QuanNcIjogXCJeMC43LjNcIixcbiAgICBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiOiBcIl41LjM2LjJcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiOiBcIl4zLjUuMFwiLFxuICAgIFwiQHdlYjNtb2RhbC93YWdtaVwiOiBcIl40LjIuM1wiLFxuICAgIFwiYXhpb3NcIjogXCJeMC4yNy4yXCIsXG4gICAgXCJibG9cIjogXCJeMS4yLjBcIixcbiAgICBcImNsYXNzbmFtZXNcIjogXCJeMi4zLjFcIixcbiAgICBcImRhdGUtZm5zXCI6IFwiXjIuMjkuM1wiLFxuICAgIFwiZGF0ZS1mbnMtdHpcIjogXCJeMi4wLjFcIixcbiAgICBcImV0aGVyc1wiOiBcIl41LjcuMlwiLFxuICAgIFwiZXZtLXByb3h5LWRldGVjdGlvblwiOiBcIl4xLjEuMFwiLFxuICAgIFwiZm9ybWlrXCI6IFwiXjIuMi45XCIsXG4gICAgXCJmcmFtZXItbW90aW9uXCI6IFwiXjYuNS4xXCIsXG4gICAgXCJncmFwaHFsXCI6IFwiXjE2LjYuMFwiLFxuICAgIFwiaTE4bmV4dFwiOiBcIl4yMy4xMC4xXCIsXG4gICAgXCJpMThuZXh0LWJyb3dzZXItbGFuZ3VhZ2VkZXRlY3RvclwiOiBcIl42LjEuNVwiLFxuICAgIFwianMtYmlnLWRlY2ltYWxcIjogXCJeMS4zLjEyXCIsXG4gICAgXCJsb2Rhc2guY2FtZWxjYXNlXCI6IFwiXjQuMy4wXCIsXG4gICAgXCJsb2Rhc2guZGVib3VuY2VcIjogXCJeNC4wLjhcIixcbiAgICBcImxvZGFzaC5ncm91cGJ5XCI6IFwiXjQuNi4wXCIsXG4gICAgXCJsb2Rhc2guaXNlcXVhbFwiOiBcIl40LjUuMFwiLFxuICAgIFwibW9yYWxpc1wiOiBcIl4yLjI3LjFcIixcbiAgICBcInJlYWN0XCI6IFwiXjE4LjIuMFwiLFxuICAgIFwicmVhY3QtY2FsZW5kYXJcIjogXCJeNS4wLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LWkxOG5leHRcIjogXCJeMTMuNS4wXCIsXG4gICAgXCJyZWFjdC1pZGxlLXRpbWVyXCI6IFwiXjUuNS4zXCIsXG4gICAgXCJyZWFjdC1pbWFnZVwiOiBcIl40LjAuM1wiLFxuICAgIFwicmVhY3QtbWFya2Rvd25cIjogXCJeOS4wLjBcIixcbiAgICBcInJlYWN0LXJvdXRlci1kb21cIjogXCJeNi4yMi4wXCIsXG4gICAgXCJyZWFjdC10b2FzdGlmeVwiOiBcIl45LjAuOFwiLFxuICAgIFwicmVtYXJrLWdmbVwiOiBcIl40LjAuMFwiLFxuICAgIFwidmllbVwiOiBcIl4yLjEzLjFcIixcbiAgICBcInZpdGVcIjogXCJeNS4xLjBcIixcbiAgICBcInZpdGUtcGx1Z2luLWNoZWNrZXJcIjogXCJeMC42LjRcIixcbiAgICBcIndhZ21pXCI6IFwiXjIuOS43XCIsXG4gICAgXCJ5dXBcIjogXCJeMVwiLFxuICAgIFwienVzdGFuZFwiOiBcIl40LjUuMlwiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1leHQgLnRzLC50c3ggLS1maXhcIixcbiAgICBcImxpbnQ6Y2hlY2tcIjogXCJlc2xpbnQgLiAtLWV4dCAudHMsLnRzeFwiLFxuICAgIFwicHJldHR5XCI6IFwicHJldHRpZXIgLiAtLXdyaXRlXCIsXG4gICAgXCJwcmV0dHk6Y2hlY2tcIjogXCJwcmV0dGllciAuIC0tY2hlY2tcIixcbiAgICBcImRldlwiOiBcInZpdGUgLS1mb3JjZVwiLFxuICAgIFwiZGV2Om5ldGxpZnlcIjogXCJuZXRsaWZ5IGRldlwiLFxuICAgIFwic3RhcnRcIjogXCJ2aXRlIHN0YXJ0XCIsXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCIsXG4gICAgXCJidWlsZFwiOiBcIk5PREVfT1BUSU9OUz0tLW1heC1vbGQtc3BhY2Utc2l6ZT04MTkyIHZpdGUgYnVpbGRcIixcbiAgICBcImdyYXBocWw6YnVpbGRcIjogXCJncmFwaGNsaWVudCBidWlsZFwiLFxuICAgIFwiZ3JhcGhxbDpkZXYtc2VydmVyXCI6IFwiZ3JhcGhjbGllbnQgc2VydmUtZGV2XCIsXG4gICAgXCJ0ZXN0XCI6IFwidml0ZXN0IC0tZGlyPXRlc3RcIixcbiAgICBcInBvc3RpbnN0YWxsXCI6IFwibnBtIHJ1biBncmFwaHFsOmJ1aWxkXCJcbiAgfSxcbiAgXCJlbmdpbmVzXCI6IHtcbiAgICBcIm5vZGVcIjogXCIyMC4xMi4wXCIsXG4gICAgXCJucG1cIjogXCIxMC41LjBcIlxuICB9LFxuICBcImJyb3dzZXJzbGlzdFwiOiB7XG4gICAgXCJwcm9kdWN0aW9uXCI6IFtcbiAgICAgIFwiPjAuMiVcIixcbiAgICAgIFwibm90IGRlYWRcIixcbiAgICAgIFwibm90IG9wX21pbmkgYWxsXCJcbiAgICBdLFxuICAgIFwiZGV2ZWxvcG1lbnRcIjogW1xuICAgICAgXCJsYXN0IDEgY2hyb21lIHZlcnNpb25cIixcbiAgICAgIFwibGFzdCAxIGZpcmVmb3ggdmVyc2lvblwiLFxuICAgICAgXCJsYXN0IDEgc2FmYXJpIHZlcnNpb25cIlxuICAgIF1cbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGdyYXBocHJvdG9jb2wvY2xpZW50LWNsaVwiOiBcIl4yLjIuMjBcIixcbiAgICBcIkB0ZXN0aW5nLWxpYnJhcnkvamVzdC1kb21cIjogXCJeNS4xNi41XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L3JlYWN0XCI6IFwiXjE0LjIuMVwiLFxuICAgIFwiQHR5cGVzL2xvZGFzaC5jYW1lbGNhc2VcIjogXCJeNC4zLjlcIixcbiAgICBcIkB0eXBlcy9sb2Rhc2guZGVib3VuY2VcIjogXCJeNC4wLjlcIixcbiAgICBcIkB0eXBlcy9sb2Rhc2guZ3JvdXBieVwiOiBcIl40LjYuOVwiLFxuICAgIFwiQHR5cGVzL2xvZGFzaC5pc2VxdWFsXCI6IFwiXjQuNS44XCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMC4xN1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4wLjZcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luXCI6IFwiXjYuMTkuMFwiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlclwiOiBcIl42LjE5LjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMi4xXCIsXG4gICAgXCJlbmNvZGluZ1wiOiBcIl4wLjEuMTNcIixcbiAgICBcImVzbGludFwiOiBcIl44LjIyLjBcIixcbiAgICBcImVzbGludC1jb25maWctYWlyYm5iLXR5cGVzY3JpcHRcIjogXCJeMTcuMS4wXCIsXG4gICAgXCJlc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiXjkuMS4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLWltcG9ydFwiOiBcIl4yLjI2LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3RcIjogXCJeNy4zMy4yXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LWhvb2tzXCI6IFwiXjQuNi4wXCIsXG4gICAgXCJqc2RvbVwiOiBcIl4yNC4wLjBcIixcbiAgICBcIm5ldGxpZnktY2xpXCI6IFwiXjE3LjMzLjNcIixcbiAgICBcInByZXR0aWVyXCI6IFwiXjMuMi41XCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuMy4zXCIsXG4gICAgXCJ1cmxcIjogXCJeMC4xMS4wXCIsXG4gICAgXCJ2aXRlc3RcIjogXCJeMS4yLjJcIlxuICB9XG59XG4iXSwKICAibWFwcGlu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
