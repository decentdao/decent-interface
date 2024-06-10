import { getStore } from '@netlify/blobs';
import camelCase from 'lodash.camelcase';
import Moralis from 'moralis';
import { isAddress } from 'viem';
import { sepolia, mainnet, base, baseSepolia, optimism, polygon } from 'viem/chains';
import type { TokenBalance } from '../../src/types';

const SUPPORTED_NETWORKS = [
  mainnet.id,
  polygon.id,
  sepolia.id,
  baseSepolia.id,
  base.id,
  optimism.id,
] as const;
type SupportedNetworks = (typeof SUPPORTED_NETWORKS)[number];

const camelCaseKeys = (obj: any) =>
  Object.keys(obj).reduce(
    (ccObj, field) => ({
      ...ccObj,
      [camelCase(field)]: obj[field],
    }),
    {},
  );

type AddressBalancesWithMetadata = {
  data: {
    tokens: TokenBalance[];
  };
  metadata: {
    fetched: number;
  };
};

export default async function getTokenBalancesWithPrices(request: Request) {
  if (!process.env.MORALIS_API_KEY) {
    console.error('Moralis API key is missing');
    return Response.json({ error: 'Error while fetching token balances' }, { status: 503 });
  }

  if (!process.env.BALANCES_CACHE_INTERVAL_MINUTES) {
    console.error('BALANCES_CACHE_INTERVAL_MINUTES is not set');
    return Response.json({ error: 'Error while fetching prices' }, { status: 503 });
  }

  const requestSearchParams = new URL(request.url).searchParams;
  const addressParam = requestSearchParams.get('address');

  if (!addressParam) {
    return Response.json({ error: 'Address missing from request' }, { status: 400 });
  }

  if (!isAddress(addressParam)) {
    return Response.json({ error: 'Provided address is not a valid address' }, { status: 400 });
  }

  const networkParam = requestSearchParams.get('network');
  if (!networkParam) {
    return Response.json({ error: 'Network missing from request' }, { status: 400 });
  }

  const chainId = parseInt(networkParam) as SupportedNetworks;
  if (!SUPPORTED_NETWORKS.includes(chainId)) {
    return Response.json({ error: 'Requested network is not supported' }, { status: 400 });
  }

  const store = getStore('token-balances');
  const nowSeconds = Math.floor(Date.now() / 1000);
  const cacheTimeSeconds = parseInt(process.env.BALANCES_CACHE_INTERVAL_MINUTES) * 60;
  const config = { store, nowSeconds, cacheTimeSeconds };
  const storeKey = `${networkParam}/${addressParam}`;
  try {
    const balances = await (store.getWithMetadata(storeKey, {
      type: 'json',
    }) as Promise<AddressBalancesWithMetadata> | null);

    if (
      balances?.metadata.fetched &&
      balances.metadata.fetched + config.cacheTimeSeconds > config.nowSeconds
    ) {
      return Response.json({ data: balances.data });
    } else {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });

      const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
        chain: chainId.toString(),
        address: addressParam,
      });

      const mappedTokensData = response.result.map(tokenBalance =>
        camelCaseKeys(tokenBalance.toJSON()),
      );
      const responseBody = { tokens: mappedTokensData };
      await store.setJSON(storeKey, responseBody, { metadata: { fetched: config.nowSeconds } });

      return Response.json({ data: responseBody });
    }
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: 'Unexpected error while fetching token balances' },
      { status: 503 },
    );
  }
}
