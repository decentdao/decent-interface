import { useCallback } from 'react';
import { Address, GetEnsNameReturnType } from 'viem';
import { DAOQueryDocument } from '../../../.graphclient';
import graphQLClient from '../../graphql';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';
import { useNetworkEnsNameAsync } from '../useNetworkEnsName';
import { createAccountSubstring } from './useGetAccountName';

export const getSafeName = async (
  subgraph: { space: number; slug: string; version: string },
  address: Address,
  getEnsName: (args: { address: Address }) => Promise<GetEnsNameReturnType>,
) => {
  const ensName = await getEnsName({ address });
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
  ).data?.daos[0]?.name;

  if (subgraphName) {
    return subgraphName;
  }

  return createAccountSubstring(address);
};

export const useGetSafeName = (chainId?: number) => {
  const { getConfigByChainId } = useNetworkConfigStore();
  const { getEnsName } = useNetworkEnsNameAsync({ chainId });
  return {
    getSafeName: useCallback(
      (address: Address) => {
        return getSafeName(getConfigByChainId(chainId).subgraph, address, getEnsName);
      },
      [chainId, getConfigByChainId, getEnsName],
    ),
  };
};
