import { getStore } from '@netlify/blobs';
import Moralis from 'moralis';
import { isAddress } from 'viem';
import { moralisSupportedChainIds } from '../../src/providers/NetworkConfig/NetworkConfigProvider';
import type { NFTBalance } from '../../src/types';
import { camelCaseKeys } from '../../src/utils/dataFormatter';

type NFTBalancesWithMetadata = {
  data: NFTBalance[];
  metadata: {
    fetched: number;
    firstFetched: number;
  };
};

export default async function getNftBalances(request: Request) {
  if (!process.env.MORALIS_API_KEY) {
    console.error('Moralis API key is missing');
    return Response.json({ error: 'Error while fetching token balances' }, { status: 503 });
  }

  if (!process.env.BALANCES_CACHE_INTERVAL_MINUTES) {
    console.error('BALANCES_CACHE_INTERVAL_MINUTES is not set');
    return Response.json({ error: 'Error while fetching prices' }, { status: 503 });
  }

  if (!process.env.BALANCES_MORALIS_INDEX_DELAY_MINUTES) {
    console.error('BALANCES_MORALIS_INDEX_DELAY_MINUTES is not set');
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

  const chainId = parseInt(networkParam);
  if (!moralisSupportedChainIds.includes(chainId)) {
    return Response.json({ error: 'Requested network is not supported' }, { status: 400 });
  }

  const nftsStore = getStore(`moralis-balances-nfts-${networkParam}`);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const cacheTimeSeconds = parseInt(process.env.BALANCES_CACHE_INTERVAL_MINUTES) * 60;
  const moralisIndexDelaySeconds = parseInt(process.env.BALANCES_MORALIS_INDEX_DELAY_MINUTES) * 60;
  const config = { nowSeconds, cacheTimeSeconds, moralisIndexDelaySeconds };
  const storeKey = addressParam;
  try {
    const balances = await (nftsStore.getWithMetadata(storeKey, {
      type: 'json',
    }) as Promise<NFTBalancesWithMetadata> | null);

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
      balances.metadata.fetched + config.cacheTimeSeconds > config.nowSeconds &&
      (balances.metadata.firstFetched + config.moralisIndexDelaySeconds < config.nowSeconds ||
        (balances.data.length > 0 &&
          balances.metadata.firstFetched + config.moralisIndexDelaySeconds > config.nowSeconds))
    ) {
      return Response.json({ data: balances.data });
    }

    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
    }

    let mappedNftsData: NFTBalance[] = [];

    try {
      const nftsResponse = await Moralis.EvmApi.nft.getWalletNFTs({
        chain: chainId.toString(),
        address: addressParam,
      });

      mappedNftsData = nftsResponse.result.map(nftBalance =>
        camelCaseKeys<ReturnType<typeof nftBalance.toJSON>>(nftBalance.toJSON()),
      );

      const firstFetched = balances?.metadata.firstFetched ?? config.nowSeconds;
      await nftsStore.setJSON(storeKey, mappedNftsData, {
        metadata: { fetched: config.nowSeconds, firstFetched },
      });
    } catch (e) {
      console.error('Error while fetching address NFTs', e);
    }

    return Response.json({ data: mappedNftsData });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: 'Unexpected error while fetching NFTs balances' },
      { status: 503 },
    );
  }
}
