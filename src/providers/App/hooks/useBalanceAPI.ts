import { useCallback } from 'react';
import { Address } from 'viem';
import { TokenBalance } from '../../../types';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

export default function useBalanceAPI() {
  const { chain } = useNetworkConfig();

  const getSafeBalances = useCallback(
    async (address: Address) => {
      const balancesResponse = await fetch(
        `/.netlify/functions/tokenBalances?address=${address}&network=${chain.id}`,
      );
      const balancesResponseResult = await balancesResponse.json();
      // @todo - handle errors returned
      return balancesResponseResult.data as {
        assetsFungible: TokenBalance[];
        assetsNonFungible: any[];
      };
    },
    [chain.id],
  );

  return getSafeBalances;
}
