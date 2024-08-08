import type { Store } from '@netlify/blobs';
import Moralis from 'moralis';
import type { Address } from 'viem';
import type { DefiBalance } from '../../src/types';
import { camelCaseKeys } from '../../src/utils/dataFormatter';
import { BalanceDataWithMetadata, getBalances } from '../shared/moralisBalances.mts';

export default async function getDefiBalancesWithPrices(request: Request) {
  const fetchFromStore = async (store: Store, storeKey: string) => {
    return store.getWithMetadata(storeKey, {
      type: 'json',
    }) as Promise<BalanceDataWithMetadata<DefiBalance>> | null;
  };

  const fetchFromMoralis = async (scope: { chain: string; address: Address }) => {
    const defiResponse = await Moralis.EvmApi.wallets.getDefiPositionsSummary(scope);

    const mappedDefiData = defiResponse.result
      .filter(defiBalance => !!defiBalance.position?.balanceUsd)
      .map(defiBalance => {
        const balanceJSON = camelCaseKeys(defiBalance.toJSON()) as unknown as DefiBalance;
        const mappedBalance = {
          ...balanceJSON,
          position: balanceJSON.position
            ? {
                ...camelCaseKeys(balanceJSON.position),
                tokens: balanceJSON.position.tokens.map(token => camelCaseKeys(token)),
              }
            : undefined,
        };
        return mappedBalance;
      });

    return mappedDefiData;
  };

  return getBalances(request, 'defi', fetchFromStore, fetchFromMoralis);
}
