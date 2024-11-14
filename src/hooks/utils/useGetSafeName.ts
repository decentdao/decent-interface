import { useCallback } from 'react';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { DAOQueryDocument } from '../../../.graphclient';
import graphQLClient from '../../graphql';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { createAccountSubstring } from './useGetAccountName';

export const useGetSafeName = (chainId?: number) => {
  const publicClient = usePublicClient({ chainId });
  const { subgraph } = useNetworkConfig(chainId);

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

      const subgraphName = (
        await graphQLClient.query({
          query: DAOQueryDocument,
          variables: { safeAddress: address },
          context: {
            subgraphSpace: subgraph.space,
            subgraphSlug: subgraph.slug,
            subgraphVersion: subgraph.version,
          },
        })
      ).data?.daos[0].name;

      if (subgraphName) {
        return subgraphName;
      }

      return createAccountSubstring(address);
    },
    [publicClient, subgraph],
  );

  return { getSafeName };
};
