import { FractalRegistry, FractalUsul__factory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { Dispatch, useEffect, useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { getUsulModuleFromModules } from '../../../hooks/DAO/proposal/useUsul';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { IGnosis, GnosisActions, SafeInfoResponseWithGuard, GnosisAction } from '../../../types';

export default function useNodes({
  gnosis,
  gnosisDispatch,
  chainId,
}: {
  gnosis: IGnosis;
  gnosisDispatch: Dispatch<GnosisActions>;
  chainId: number;
}) {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const {
    fractalRegistryContract,
    gnosisVetoGuardMasterCopyContract,
    usulVetoGuardMasterCopyContract,
  } = useSafeContracts();

  const { modules, safe, safeService } = gnosis;

  const fetchSubDAOs = useCallback(
    async (parentDAOAddress: string) => {
      const eventRPC = getEventRPC<FractalRegistry>(fractalRegistryContract!, chainId);
      const filter = eventRPC.filters.FractalSubDAODeclared(parentDAOAddress);
      const events = await eventRPC.queryFilter(filter);
      const subDAOsAddresses = events.map(({ args }) => args.subDAOAddress);

      return subDAOsAddresses;
    },
    [chainId, fractalRegistryContract]
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
          const usulModule = getUsulModuleFromModules(modules);
          if (usulModule && usulVetoGuardMasterCopyContract) {
            const usulContract = FractalUsul__factory.connect(
              usulModule.moduleAddress,
              signerOrProvider
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
    [gnosisVetoGuardMasterCopyContract, usulVetoGuardMasterCopyContract, modules, signerOrProvider]
  );

  useEffect(() => {
    const loadDaoParent = async () => {
      if (safe && safe.guard) {
        const owner = await getDAOOwner(safe);
        if (owner) {
          gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: owner });
        }
      } else {
        // Clearing the state
        gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: '' });
      }
    };

    loadDaoParent();
  }, [
    safe,
    modules,
    gnosisDispatch,
    safeService,
    fetchSubDAOs,
    getDAOOwner,
    fractalRegistryContract,
  ]);
}
