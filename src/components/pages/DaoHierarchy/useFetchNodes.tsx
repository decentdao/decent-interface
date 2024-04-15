import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { Address, getAddress, getContract, zeroAddress } from 'viem';
import { DAOQueryDocument } from '../../../../.graphclient';
import { logError } from '../../../helpers/errorLogging';
import { useFractalModules } from '../../../hooks/DAO/loaders/useFractalModules';
import { useAsyncRetry } from '../../../hooks/utils/useAsyncRetry';
import useContractClient from '../../../hooks/utils/useContractClient';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeInfoResponseWithGuard } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';

export function useFetchNodes(address?: string) {
  const [childNodes, setChildNodes] = useState<SafeInfoResponseWithGuard[]>();
  const { walletOrPublicClient } = useContractClient();

  const {
    node: { safe, nodeHierarchy },
    baseContracts,
  } = useFractal();

  const safeAPI = useSafeAPI();
  const { requestWithRetries } = useAsyncRetry();

  const { subgraph } = useNetworkConfig();
  const { data, error } = useQuery(DAOQueryDocument, {
    variables: { daoAddress: address },
    skip: address === safe?.address || !address, // If address === safe.address - we already have hierarchy obtained in the context
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
  });

  const lookupModules = useFractalModules();

  const getDAOOwner = useCallback(
    async (safeInfo?: Partial<SafeInfoResponseWithGuard>) => {
      if (safeInfo && safeInfo.guard && baseContracts && walletOrPublicClient) {
        const {
          multisigFreezeGuardMasterCopyContract,
          azoriusFreezeGuardMasterCopyContract,
          fractalAzoriusMasterCopyContract,
        } = baseContracts;
        if (safeInfo.guard !== zeroAddress) {
          const guard = getContract({
            abi: multisigFreezeGuardMasterCopyContract.asPublic.abi,
            address: safeInfo.guard as Address,
            client: walletOrPublicClient,
          });
          const guardOwner = await guard.read.owner();
          if (guardOwner !== safeInfo.address) {
            return guardOwner;
          }
        } else {
          const modules = await lookupModules((safeInfo.modules as Address[]) || []);
          if (!modules || !walletOrPublicClient) return;
          const azoriusModule = getAzoriusModuleFromModules(modules);
          if (
            azoriusModule &&
            azoriusFreezeGuardMasterCopyContract &&
            fractalAzoriusMasterCopyContract
          ) {
            const azoriusContract = getContract({
              abi: fractalAzoriusMasterCopyContract.asPublic.abi,
              address: azoriusModule.moduleAddress as Address,
              client: walletOrPublicClient,
            });
            const azoriusGuardAddress = await azoriusContract.read.getGuard();
            if (azoriusGuardAddress !== zeroAddress) {
              const guard = getContract({
                abi: azoriusFreezeGuardMasterCopyContract.asPublic.abi,
                address: azoriusGuardAddress as Address,
                client: walletOrPublicClient,
              });
              const guardOwner = await guard.read.owner();
              if (guardOwner !== safeInfo.address) {
                return guardOwner;
              }
            }
          }
        }
      }
      return undefined;
    },
    [baseContracts, lookupModules, walletOrPublicClient],
  );

  const fetchDAOInfo = useCallback(
    async (safeAddress: string) => {
      if (safeAPI) {
        return (await safeAPI.getSafeInfo(getAddress(safeAddress))) as SafeInfoResponseWithGuard;
      }
    },
    [safeAPI],
  );

  const fetchSubDAOs = useCallback(async () => {
    // @remove
    let nodes: any = nodeHierarchy.childNodes;
    if (safe?.address !== address && data && !error) {
      // Means we're getting childNodes for current's DAO parent, and not the DAO itself
      nodes = data.daos[0]?.hierarchy;
    }
    const subDAOs: SafeInfoResponseWithGuard[] = [];
    for await (const subDAO of nodes) {
      try {
        const safeInfo = await requestWithRetries(() => fetchDAOInfo(subDAO.address), 5, 5000);
        if (safeInfo && safeInfo.guard) {
          if (safeInfo.guard === zeroAddress) {
            subDAOs.push(safeInfo);
          } else {
            const owner = await getDAOOwner(safeInfo);
            if (owner && address && owner === getAddress(address)) {
              // push node address
              subDAOs.push(safeInfo);
            }
          }
        }
      } catch (e) {
        logError('Error while verifying subDAO ownership', e, subDAO);
      }
    }
    // set subDAOs
    setChildNodes(subDAOs);
  }, [getDAOOwner, nodeHierarchy, address, data, error, safe, fetchDAOInfo, requestWithRetries]);

  useEffect(() => {
    if (address) {
      fetchSubDAOs();
    }
  }, [fetchSubDAOs, address]);

  return { childNodes };
}
