import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useFractalModules } from '../../../hooks/DAO/loaders/useFractalModules';
import { useFractal } from '../../../providers/App/AppProvider';
import { SafeInfoResponseWithGuard } from '../../../types';
import { getUsulModuleFromModules } from '../../../utils';

export function useFetchNodes(address?: string) {
  const [childNodes, setChildNodes] = useState<SafeInfoResponseWithGuard[]>();

  const {
    node: { safe, nodeHierarchy },
    clients: { safeService },
    baseContracts: {
      gnosisVetoGuardMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      fractalUsulMasterCopyContract,
    },
  } = useFractal();
  const { data, error } = useQuery(DAOQueryDocument, {
    variables: { daoAddress: address },
    skip: address === safe?.address, // If address === safe.address - we already have hierarchy obtained in the context
  });

  const lookupModules = useFractalModules();

  const getDAOOwner = useCallback(
    async (safeInfo?: Partial<SafeInfoResponseWithGuard>) => {
      if (safeInfo && safeInfo.guard && gnosisVetoGuardMasterCopyContract) {
        if (safeInfo.guard !== ethers.constants.AddressZero) {
          const guard = gnosisVetoGuardMasterCopyContract.asSigner.attach(safeInfo.guard);
          const guardOwner = await guard.owner();
          if (guardOwner !== safeInfo.address) {
            return guardOwner;
          }
        } else {
          const modules = await lookupModules(safeInfo.modules || []);
          if (!modules) return;
          const usulModule = getUsulModuleFromModules(modules);
          if (usulModule && usulVetoGuardMasterCopyContract && fractalUsulMasterCopyContract) {
            const usulContract = fractalUsulMasterCopyContract?.asSigner.attach(
              usulModule.moduleAddress
            );
            const usulGuardAddress = await usulContract.getGuard();
            if (usulGuardAddress !== ethers.constants.AddressZero) {
              const guard = usulVetoGuardMasterCopyContract.asSigner.attach(usulGuardAddress);
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
      gnosisVetoGuardMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      fractalUsulMasterCopyContract,
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
        console.error('Error while verifying subDAO ownership', e, subDAO);
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
