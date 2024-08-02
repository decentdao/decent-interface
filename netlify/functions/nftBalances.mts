import type { Store } from '@netlify/blobs';
import Moralis from 'moralis';
import type { Address } from 'viem';
import type { NFTBalance } from '../../src/types';
import { camelCaseKeys } from '../../src/utils/dataFormatter';
import { BalanceDataWithMetadata, getBalances } from '../shared/moralisBalances.mts';

export default async function getNftBalances(request: Request) {
  const fetchFromStore = async (store: Store, storeKey: string) => {
    return store.getWithMetadata(storeKey, {
      type: 'json',
    }) as Promise<BalanceDataWithMetadata<NFTBalance>> | null;
  };

  const fetchFromMoralis = async (scope: { chain: string; address: Address }) => {
    const nftsResponse = await Moralis.EvmApi.nft.getWalletNFTs(scope);

    const mappedNftsData = nftsResponse.result.map(
      nftBalance =>
        camelCaseKeys<ReturnType<typeof nftBalance.toJSON>>(
          nftBalance.toJSON(),
        ) as unknown as NFTBalance,
    );

    return mappedNftsData;
  };

  return getBalances(request, 'nfts', fetchFromStore, fetchFromMoralis);
}
