import { getStore } from '@netlify/blobs';
import type { Store } from '@netlify/blobs';
import Moralis from 'moralis';
import { isAddress } from 'viem';
import type { Address } from 'viem';
import { moralisSupportedChainIds } from '../../src/providers/NetworkConfig/useNetworkConfigStore';

export interface BalanceDataWithMetadata<T> {
  data: T[];
  metadata: {
    fetched: number;
    firstFetched: number;
  };
}

const returnCache = <T,>(data: T[]) => {
  return Response.json({ data });
};

const refetch = async <T,>(refetchParams: {
  fetchFromMoralis: (scope: { chain: string; address: Address }) => Promise<T[]>;
  chain: string;
  address: Address;
  balances: BalanceDataWithMetadata<T> | null;
  nowSeconds: number;
  store: Store;
}) => {
  const { fetchFromMoralis, chain, address, balances, nowSeconds, store } = refetchParams;

  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }

  const mappedData = await fetchFromMoralis({ chain, address });
  const firstFetched = balances?.metadata.firstFetched ?? nowSeconds;
  await store.setJSON(address, mappedData, {
    metadata: { fetched: nowSeconds, firstFetched },
  });

  return Response.json({ data: mappedData });
};

export async function getBalances<T>(
  request: Request,
  storeName: string,
  fetchFromStore: (store: Store, storeKey: string) => Promise<BalanceDataWithMetadata<T> | null>,
  fetchFromMoralis: (scope: { chain: string; address: Address }) => Promise<T[]>,
) {
  if (!process.env.MORALIS_API_KEY) {
    console.error('Moralis API key is missing');
    return Response.json({ error: 'Internal server error' }, { status: 503 });
  }

  if (!process.env.BALANCES_CACHE_INTERVAL_MINUTES) {
    console.error('BALANCES_CACHE_INTERVAL_MINUTES is not set');
    return Response.json({ error: 'Internal server error' }, { status: 503 });
  }

  if (!process.env.BALANCES_MORALIS_INDEX_DELAY_MINUTES) {
    console.error('BALANCES_MORALIS_INDEX_DELAY_MINUTES is not set');
    return Response.json({ error: 'Internal server error' }, { status: 503 });
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

  const chainId = parseInt(networkParam);
  if (!moralisSupportedChainIds.includes(chainId)) {
    return Response.json({ error: 'Requested network is not supported' }, { status: 400 });
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const cacheTimeSeconds = parseInt(process.env.BALANCES_CACHE_INTERVAL_MINUTES) * 60;
  const moralisIndexDelaySeconds = parseInt(process.env.BALANCES_MORALIS_INDEX_DELAY_MINUTES) * 60;
  const store = getStore(`moralis-balances-${storeName}-${networkParam}`);

  try {
    const balances = await fetchFromStore(store, addressParam);

    const refetchParams = {
      fetchFromMoralis,
      chain: networkParam,
      address: addressParam,
      balances,
      nowSeconds,
      store,
    };

    if (!balances) {
      return await refetch(refetchParams);
    }

    const insideMoralisIndexingBuffer =
      balances.metadata.firstFetched + moralisIndexDelaySeconds > nowSeconds;
    const lastFetchedDuringMoralisIndexingBuffer =
      balances.metadata.firstFetched + moralisIndexDelaySeconds > balances.metadata.fetched;
    const haveData = balances.data.length > 0;
    const expiredCache = balances.metadata.fetched + cacheTimeSeconds < nowSeconds;

    // inside buffer, no data: refetch
    if (insideMoralisIndexingBuffer && !haveData) {
      return await refetch(refetchParams);
    }

    // inside buffer, have data: return cache
    if (insideMoralisIndexingBuffer && haveData) {
      return returnCache(balances.data);
    }

    // outside buffer, no data, last fetch during buffer: refetch
    if (!insideMoralisIndexingBuffer && !haveData && lastFetchedDuringMoralisIndexingBuffer) {
      return await refetch(refetchParams);
    }

    // outside buffer, no data, last fetch after buffer, expired cache: refetch
    if (
      !insideMoralisIndexingBuffer &&
      !haveData &&
      !lastFetchedDuringMoralisIndexingBuffer &&
      expiredCache
    ) {
      return await refetch(refetchParams);
    }

    // outside buffer, no data, last fetch after buffer, valid cache: return cache
    if (
      !insideMoralisIndexingBuffer &&
      !haveData &&
      !lastFetchedDuringMoralisIndexingBuffer &&
      !expiredCache
    ) {
      return returnCache(balances.data);
    }

    // outside buffer, have data, expired cache: refresh
    if (!insideMoralisIndexingBuffer && haveData && expiredCache) {
      return await refetch(refetchParams);
    }

    // outside buffer, have data, valid cache: return cache
    if (!insideMoralisIndexingBuffer && haveData && !expiredCache) {
      return returnCache(balances.data);
    }

    throw new Error(
      `How did we get here?\n
      ${{ networkParam, addressParam }}\n
      ${{ expiredCache, insideMoralisIndexingBuffer, haveData, lastFetchedDuringMoralisIndexingBuffer }}`,
    );
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Unexpected error while fetching balances' }, { status: 503 });
  }
}
