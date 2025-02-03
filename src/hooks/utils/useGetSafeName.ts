import { useCallback } from 'react';
import { useClient } from 'urql';
import { Address, GetEnsNameReturnType } from 'viem';
import { DAOQueryDocument } from '../../graphql/DAOQuery';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';
import { useNetworkEnsNameAsync } from '../useNetworkEnsName';
import { createAccountSubstring } from './useGetAccountName';

export const getSafeName = async (
  subgraph: { space: number; slug: string; version: string },
  address: Address,
  getEnsName: (args: { address: Address }) => Promise<GetEnsNameReturnType>,
  client: ReturnType<typeof useClient>,
) => {
  const ensName = await getEnsName({ address });
  if (ensName) {
    return ensName;
  }

  const queryResult = await client.query(
    DAOQueryDocument,
    { safeAddress: address },
    {
      requestPolicy: 'network-only',
      context: {
        subgraphSpace: subgraph.space,
        subgraphSlug: subgraph.slug,
        subgraphVersion: subgraph.version,
      },
    },
  );

  const subgraphName = queryResult.data?.daos[0]?.name;

  if (subgraphName) {
    return subgraphName;
  }

  return createAccountSubstring(address);
};

export const useGetSafeName = (chainId?: number) => {
  const { getConfigByChainId } = useNetworkConfigStore();
  const { getEnsName } = useNetworkEnsNameAsync();
  const client = useClient();

  return {
    getSafeName: useCallback(
      (address: Address) => {
        return getSafeName(getConfigByChainId(chainId).subgraph, address, getEnsName, client);
      },
      [chainId, getConfigByChainId, getEnsName, client],
    ),
  };
};
