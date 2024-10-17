import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { Address, PublicClient, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { demoData } from '../DAO/loaders/loadDemoData';
import { createAccountSubstring } from './useDisplayName';

export const getSafeNameFallback = async (
  address: Address,
  fractalRegistry: Address,
  publicClient: PublicClient | undefined,
) => {
  if (!publicClient || !publicClient.chain) {
    return;
  }

  const fractalRegistryContract = getContract({
    abi: abis.FractalRegistry,
    address: fractalRegistry,
    client: publicClient,
  });

  const events = await fractalRegistryContract.getEvents.FractalNameUpdated(
    { daoAddress: address },
    { fromBlock: 0n },
  );

  const latestEvent = events.pop();

  if (latestEvent?.args.daoName) {
    return latestEvent.args.daoName;
  } else if (publicClient.chain && demoData[publicClient.chain.id]) {
    const demo = demoData[publicClient.chain.id][address];
    if (demo && demo.name) {
      return demo.name;
    }
  }
};

export const useGetAccountName = (chainId?: number) => {
  const publicClient = usePublicClient({ chainId });

  const getAccountName = useCallback(
    async (address: Address, getAccountNameFallback?: () => Promise<string | undefined>) => {
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

      if (getAccountNameFallback) {
        return (await getAccountNameFallback()) ?? createAccountSubstring(address);
      }

      return createAccountSubstring(address);
    },
    [publicClient],
  );

  return { getAccountName };
};
