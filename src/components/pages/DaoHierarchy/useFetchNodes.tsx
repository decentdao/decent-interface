import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { DAOQueryDocument } from '../../../../.graphclient';
import { logError } from '../../../helpers/errorLogging';
import { useFractalModules } from '../../../hooks/DAO/loaders/useFractalModules';
import { useFractal } from '../../../providers/App/AppProvider';
import { SafeInfoResponseWithGuard } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';

export function useFetchNodes(address?: string) {
  const [childNodes, setChildNodes] = useState<SafeInfoResponseWithGuard[]>();
  const provider = useProvider();

  const {
    node: { safe, nodeHierarchy },
    clients: { safeService },
    baseContracts: {
      multisigFreezeGuardMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      fractalAzoriusMasterCopyContract,
    },
  } = useFractal();

  const chainName = provider.network.name === 'homestead' ? 'mainnet' : provider.network.name;
  const { data, error } = useQuery(DAOQueryDocument, {
    variables: { daoAddress: address },
    skip: address === safe?.address || !address, // If address === safe.address - we already have hierarchy obtained in the context
    context: { chainName },
  });

  const lookupModules = useFractalModules();

  const getDAOOwner = useCallback(
    async (safeInfo?: Partial<SafeInfoResponseWithGuard>) => {
      if (safeInfo && safeInfo.guard && multisigFreezeGuardMasterCopyContract) {
        if (safeInfo.guard !== ethers.constants.AddressZero) {
          const guard = multisigFreezeGuardMasterCopyContract.asSigner.attach(safeInfo.guard);
          const guardOwner = await guard.owner();
          if (guardOwner !== safeInfo.address) {
            return guardOwner;
          }
        } else {
          const modules = await lookupModules(safeInfo.modules || []);
          if (!modules) return;
          const azoriusModule = getAzoriusModuleFromModules(modules);
          if (
            azoriusModule &&
            azoriusFreezeGuardMasterCopyContract &&
            fractalAzoriusMasterCopyContract
          ) {
            const azoriusContract = fractalAzoriusMasterCopyContract?.asSigner.attach(
              azoriusModule.moduleAddress
            );
            const azoriusGuardAddress = await azoriusContract.getGuard();
            if (azoriusGuardAddress !== ethers.constants.AddressZero) {
              const guard =
                azoriusFreezeGuardMasterCopyContract.asSigner.attach(azoriusGuardAddress);
              const guardOwner = await guard.owner();
              if (guardOwner !== safeInfo.address) {
                return guardOwner;
              }
            }
          }
        }
      }
      return undefined;
    },
    [
      multisigFreezeGuardMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      fractalAzoriusMasterCopyContract,
      lookupModules,
    ]
  );

  const fetchSubDAOs = useCallback(async () => {
    const { getAddress } = ethers.utils;
    // @remove
    let nodes: any = nodeHierarchy.childNodes;
    if (safe?.address !== address && data && !error) {
      // Means we're getting childNodes for current's DAO parent, and not the DAO itself
      nodes = data.daos[0]?.hierarchy;
    }
    const subDAOs: SafeInfoResponseWithGuard[] = [];
    for await (const subDAO of nodes) {
      try {
        const safeInfo = (await safeService!.getSafeInfo(
          getAddress(subDAO.address)
        )) as SafeInfoResponseWithGuard;
        if (safeInfo.guard) {
          if (safeInfo.guard === ethers.constants.AddressZero) {
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
  }, [getDAOOwner, safeService, nodeHierarchy, address, data, error, safe]);

  useEffect(() => {
    if (address) {
      fetchSubDAOs();
    }
  }, [fetchSubDAOs, address]);

  return { childNodes };
}
