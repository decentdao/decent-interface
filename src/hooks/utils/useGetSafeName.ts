import { useCallback } from 'react';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { createAccountSubstring } from './useGetAccountName';

export const useGetSafeName = (chainId?: number) => {
  const publicClient = usePublicClient({ chainId });

  const getSafeName = useCallback(
    async (address: Address) => {
      if (!publicClient || !publicClient.chain) {
        throw new Error('Public client not available');
      }

      const ensName = await publicClient.getEnsName({ address }).catch((error: Error) => {
        if (error.name === 'ChainDoesNotSupportContract') {
          // Sliently fail, this is fine.
          // https://github.com/wevm/viem/discussions/781
        } else {
          throw error;
        }
      });

      if (ensName) {
        return ensName;
      }

      return createAccountSubstring(address);
    },
    [publicClient],
  );

  return { getSafeName };
};
