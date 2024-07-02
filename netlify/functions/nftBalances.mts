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
  const config = { nowSeconds, cacheTimeSeconds };
  const storeKey = `${networkParam}/${addressParam}`;
  try {
    const balances = await (nftsStore.getWithMetadata(storeKey, {
      type: 'json',
    }) as Promise<NFTBalancesWithMetadata> | null);

    if (
      balances?.metadata.fetched &&
      balances.metadata.fetched + config.cacheTimeSeconds > config.nowSeconds
    ) {
      return Response.json({ data: balances.data });
    } else {
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.MORALIS_API_KEY,
        });
      }
      let mappedNftsData: NFTBalance[] = [];

      let nftsFetched = false;
      try {
        const nftsResponse = await Moralis.EvmApi.nft.getWalletNFTs({
          chain: chainId.toString(),
          address: addressParam,
        });
        mappedNftsData = nftsResponse.result.map(nftBalance =>
          camelCaseKeys<ReturnType<typeof nftBalance.toJSON>>(nftBalance.toJSON()),
        );
        nftsFetched = true;
      } catch (e) {
        console.error('Error while fetching address NFTs', e);
        nftsFetched = false;
      }

      if (nftsFetched) {
        await nftsStore.setJSON(storeKey, mappedNftsData, {
          metadata: { fetched: config.nowSeconds },
        });
      }

      return Response.json({ data: mappedNftsData });
    }
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: 'Unexpected error while fetching NFTs balances' },
      { status: 503 },
    );
  }
}
