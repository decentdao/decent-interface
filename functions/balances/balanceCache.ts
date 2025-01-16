import { Context } from 'hono';
import type { Address } from 'viem';
import { DefiBalance, NFTBalance, TokenBalance } from '../../src/types/daoTreasury';
import { withCache } from '../shared/kvCache';
import { Var, type Env } from '../types';

type BalanceMap = {
  tokens: TokenBalance[];
  nfts: NFTBalance[];
  defi: DefiBalance[];
};

export async function withBalanceCache<T extends keyof BalanceMap>(
  c: Context<{ Bindings: Env; Variables: Var }>,
  storeName: T,
  fetchFromMoralis: (scope: { chain: string; address: Address }) => Promise<BalanceMap[T]>,
) {
  const { address, network } = c.var;
  const storeKey = `${storeName}-${network}-${address}`;

  try {
    const cacheTimeSeconds = parseInt(c.env.BALANCES_CACHE_INTERVAL_MINUTES) * 60;
    const indexingDelaySeconds = parseInt(c.env.BALANCES_MORALIS_INDEX_DELAY_MINUTES) * 60;

    const data = await withCache<BalanceMap[T]>({
      store: c.env.balances,
      key: storeKey,
      namespace: storeName,
      options: {
        cacheTimeSeconds,
        indexingDelaySeconds,
      },
      fetch: async () => {
        try {
          return await fetchFromMoralis({ chain: network, address });
        } catch (e) {
          console.error(`Error fetching from Moralis: ${e}`);
          throw new Error('Failed to fetch from Moralis');
        }
      },
    });

    return { data };
  } catch (e) {
    console.error(e);
    return { error: 'Unexpected error while fetching balances' };
  }
}
