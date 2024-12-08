import { useCallback } from 'react';
import { Address, ChainDoesNotSupportContract, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';
import { DAOQueryDocument } from '../../../.graphclient';
import graphQLClient from '../../graphql';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { createAccountSubstring } from './useGetAccountName';

export const getSafeName = async (
  publicClient: PublicClient,
  subgraph: { space: number; slug: string; version: string },
  address: Address,
) => {
  const ensName = await publicClient.getEnsName({ address }).catch((error: Error) => {
    if (error.name === ChainDoesNotSupportContract.name) {
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
};

export const useGetSafeName = (chainId?: number) => {
  const publicClient = usePublicClient({ chainId });
  const { subgraph } = useNetworkConfig(chainId);

  return {
    getSafeName: useCallback(
      (address: Address) => {
        if (!publicClient) {
          throw new Error('Public client not available');
        }
        return getSafeName(publicClient, subgraph, address);
      },
      [publicClient, subgraph],
    ),
  };
};
