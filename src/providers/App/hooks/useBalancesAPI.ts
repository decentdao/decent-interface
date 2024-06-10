import { useCallback } from 'react';
import { Address } from 'viem';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

export default function useBalancesAPI() {
  const { chain } = useNetworkConfig();

  const getBalances = useCallback(
    async (address: Address) => {
      const balancesResponse = await fetch(
        `/.netlify/functions/tokenBalances?address=${address}&network=${chain.id}`,
      );
      const balancesResponseBody = await balancesResponse.json();
      if (balancesResponseBody.data) {
        return balancesResponseBody.data;
      }
      // @todo - handle showing error
    },
    [chain],
  );

  return getBalances;
}
