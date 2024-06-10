import { getStore } from '@netlify/blobs';
import type { Store } from '@netlify/blobs';
import { isAddress } from 'viem';

const PUBLIC_DEMO_API_BASE_URL = 'https://api.coingecko.com/api/v3/';
const AUTH_QUERY_PARAM = `?x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;

const SUPPORTED_NETWORKS = [
  'ethereum',
  'polygon',
  'base',
  'baseSepolia',
  'optimism',
  'sepolia',
] as const;
type SupportedNetworks = (typeof SUPPORTED_NETWORKS)[number];

type SafeTreasuryWithMetadata = {
  address: string;
  network: SupportedNetworks;
};
type TokenBalances = {
  data: {
    tokenAddress: string;
    balance: string;
  };
};

type Config = {
  store: Store;
  nowSeconds: number;
  cacheTimeSeconds: number;
};

async function storeTokenBalances(
  config: Config,
  tokenAddress: string,
  price: number,
  network: SupportedNetworks,
) {
  await config.store.setJSON(
    `${network}/${tokenAddress}`,
    { tokenAddress, price },
    { metadata: { fetched: config.nowSeconds } },
  );
}
