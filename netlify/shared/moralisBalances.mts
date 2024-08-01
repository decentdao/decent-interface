import { getStore } from '@netlify/blobs';
import type { Store } from '@netlify/blobs';
import Moralis from 'moralis';
import { isAddress } from 'viem';
import type { Address } from 'viem';
import { moralisSupportedChainIds } from '../../src/providers/NetworkConfig/NetworkConfigProvider';

export interface BalanceDataWithMetadata<T> {
  data: T[];
  metadata: {
    fetched: number;
    firstFetched: number;
  };
}

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

  const store = getStore(`moralis-balances-${storeName}-${networkParam}`);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const cacheTimeSeconds = parseInt(process.env.BALANCES_CACHE_INTERVAL_MINUTES) * 60;
  const moralisIndexDelaySeconds = parseInt(process.env.BALANCES_MORALIS_INDEX_DELAY_MINUTES) * 60;
  const storeKey = addressParam;
  try {
    const balances = await fetchFromStore(store, storeKey);

    // Determine whether to return cached token balances or fetch new data from Moralis API:
    // 1. Check if the cached data is still valid:
    //    - The cache is considered valid if the 'fetched' timestamp plus the cache interval is greater than the current time ('nowSeconds').
    // 2. Validate the data:
    //    - Data is considered valid if:
    //      a. The 'firstFetched' timestamp plus the Moralis index delay is less than the current time, meaning the delay period has passed.
    //      b. The data array is not empty, indicating that valid data was previously fetched.
    //      c. If the data array is empty, but the 'firstFetched' timestamp is within the Moralis index delay period, the cache is not yet considered valid.
    // If the cached data is valid according to these checks, return the cached data. Otherwise, proceed to fetch new data from the Moralis API.
    if (
      balances &&
      balances.metadata.fetched + cacheTimeSeconds > nowSeconds &&
      (balances.metadata.firstFetched + moralisIndexDelaySeconds < nowSeconds ||
        (balances.data.length > 0 &&
          balances.metadata.firstFetched + moralisIndexDelaySeconds > nowSeconds))
    ) {
      return Response.json({ data: balances.data });
    }

    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
    }

    let mappedData: T[] = [];

    try {
      mappedData = await fetchFromMoralis({ chain: chainId.toString(), address: addressParam });

      const firstFetched = balances?.metadata.firstFetched ?? nowSeconds;
      await store.setJSON(storeKey, mappedData, {
        metadata: { fetched: nowSeconds, firstFetched },
      });
    } catch (e) {
      console.error('Unexpected error while fetching balances', e);
    }

    return Response.json({ data: mappedData });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Unexpected error while fetching balances' }, { status: 503 });
  }
}
