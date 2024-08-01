import type { Store } from '@netlify/blobs';
import Moralis from 'moralis';
import type { Address } from 'viem';
import type { TokenBalance } from '../../src/types';
import { camelCaseKeys } from '../../src/utils/dataFormatter';
import { BalanceDataWithMetadata, getBalances } from './balances.mts';

export default async function getTokenBalancesWithPrices(request: Request) {
  const fetchFromStore = async (store: Store, storeKey: string) => {
    return store.getWithMetadata(storeKey, {
      type: 'json',
    }) as Promise<BalanceDataWithMetadata<TokenBalance>> | null;
  };

  const fetchFromMoralis = async (scope: { chain: string; address: Address }) => {
    const tokensResponse = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice(scope);

    const mappedTokensData = tokensResponse.result
      .filter(tokenBalance => tokenBalance.balance.value.toBigInt() > 0n)
      .map(
        tokenBalance =>
          ({
            ...camelCaseKeys(tokenBalance.toJSON()),
            decimals: Number(tokenBalance.decimals),
          }) as unknown as TokenBalance,
      );

    return mappedTokensData;
  };

  return getBalances(request, fetchFromStore, fetchFromMoralis);
}
