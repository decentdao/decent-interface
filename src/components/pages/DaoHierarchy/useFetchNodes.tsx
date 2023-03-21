import { FractalRegistry } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { getUsulModuleFromModules } from '../../../hooks/DAO/proposal/useUsul';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { useGnosisModuleTypes } from '../../../providers/Fractal/hooks/useGnosisModuleTypes';
import { SafeInfoResponseWithGuard } from '../../../types';

export function useFetchNodes(address?: string) {
  const [childNodes, setChildNodes] = useState<SafeInfoResponseWithGuard[]>();
  const provider = useProvider();
  const {
    fractalRegistryContract,
    gnosisVetoGuardMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    fractalUsulMasterCopyContract,
  } = useSafeContracts();

  const {
    gnosis: { safeService },
  } = useFractal();

  const { lookupModules } = useGnosisModuleTypes(provider.network.chainId);

  const fetchSubDAOAddresses = useCallback(
    async (parentDAOAddress: string) => {
      if (!fractalRegistryContract) {
        return [];
      }
      const eventRPC = getEventRPC<FractalRegistry>(
        fractalRegistryContract!,
        provider.network.chainId
      );
      const filter = eventRPC.filters.FractalSubDAODeclared(parentDAOAddress);
      const events = await eventRPC.queryFilter(filter);
      const subDAOsAddresses = events.map(({ args }) => args.subDAOAddress);

      return subDAOsAddresses;
    },
    [provider, fractalRegistryContract]
  );

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

  const fetchSubDAOs = useCallback(
    async (parentAddress: string) => {
      const subDAOs: SafeInfoResponseWithGuard[] = [];
      for await (const subDAOAddress of await fetchSubDAOAddresses(parentAddress)) {
        const safeInfo = (await safeService!.getSafeInfo(
          subDAOAddress
        )) as SafeInfoResponseWithGuard;
        if (safeInfo.guard) {
          if (safeInfo.guard === ethers.constants.AddressZero) {
            subDAOs.push(safeInfo);
          } else {
            const owner = await getDAOOwner(safeInfo);
            if (owner && owner === parentAddress) {
              // push node address
              subDAOs.push(safeInfo);
            }
          }
        }
      }
      // set subDAOs
      setChildNodes(subDAOs);
    },
    [fetchSubDAOAddresses, getDAOOwner, safeService]
  );

  useEffect(() => {
    if (address) {
      fetchSubDAOs(address);
    }
  }, [fetchSubDAOs, address]);

  return { childNodes };
}
