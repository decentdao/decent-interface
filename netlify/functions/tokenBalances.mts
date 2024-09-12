import type { Store } from '@netlify/blobs';
import Moralis from 'moralis';
import type { Address } from 'viem';
import type { TokenBalance } from '../../src/types';
import { camelCaseKeys } from '../../src/utils/dataFormatter';
import { BalanceDataWithMetadata, getBalances } from '../shared/moralisBalances.mts';

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
      .map(tokenBalance => {
        const tokenData = {
          ...camelCaseKeys(tokenBalance.toJSON()),
        } as unknown as TokenBalance;

        if (
          scope.chain === '1' &&
          tokenData.tokenAddress === '0x8e870d67f660d95d5be530380d0ec0bd388289e1'
        ) {
          // USDP and just hardcode it to $1 because Moralis is saying (as of Sept 11 2024) that the price is $0
          tokenData.usdPrice = 1;
          tokenData.usdValue = Number(tokenData.balanceFormatted) * tokenData.usdPrice;
        }

        return tokenData;
      });

    return mappedTokensData;
  };

  return getBalances(request, 'tokens', fetchFromStore, fetchFromMoralis);
}
