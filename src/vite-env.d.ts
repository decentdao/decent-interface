// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;

  readonly VITE_APP_NAME: string;

  readonly VITE_APP_ALCHEMY_API_KEY: string;

  readonly VITE_APP_ETHERSCAN_MAINNET_API_KEY: string;
  readonly VITE_APP_ETHERSCAN_POLYGON_API_KEY: string;
  readonly VITE_APP_ETHERSCAN_SEPOLIA_API_KEY: string;
  readonly VITE_APP_ETHERSCAN_BASE_API_KEY: string;
  readonly VITE_APP_ETHERSCAN_OPTIMISM_API_KEY: string;

  readonly VITE_APP_INFURA_IPFS_API_KEY: string;
  readonly VITE_APP_INFURA_IPFS_API_SECRET: string;

  readonly VITE_APP_SENTRY_DSN_URL: string;

  readonly VITE_APP_SHUTTER_EON_PUBKEY: string;

  readonly VITE_APP_SITE_URL: string;

  readonly VITE_APP_WALLET_CONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
