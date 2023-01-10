import { VetoGuard__factory } from '@fractal-framework/fractal-contracts';
import { SafeInfoResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { Dispatch, useEffect, useCallback } from 'react';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction } from '../constants';
import { IGnosis, GnosisActions } from '../types';

type SafeInfoWithGuard = { guard: string } & SafeInfoResponse; // safeService misses typing for guard :(
export default function useNodes({
  gnosis,
  gnosisDispatch,
}: {
  gnosis: IGnosis;
  gnosisDispatch: Dispatch<GnosisActions>;
}) {
  const {
    state: { chainId, signerOrProvider },
  } = useWeb3Provider();
  const { fractalRegistryContract } = useSafeContracts();
  const { modules, safe, safeService } = gnosis;

  const fetchSubDAOs = useCallback(
    async (parentDAOAddress: string) => {
      if (!fractalRegistryContract) {
        return;
      }
      const filter = fractalRegistryContract.filters.FractalSubDAODeclared(parentDAOAddress);
      const events = await fractalRegistryContract.queryFilter(filter);
      const subDAOsAddresses = events.map(({ args }) => args.subDAOAddress);

      return subDAOsAddresses;
    },
    [fractalRegistryContract]
  );

  useEffect(() => {
    const loadDaoParent = async () => {
      if (safe && safe.guard && signerOrProvider) {
        if (safe.guard !== ethers.constants.AddressZero) {
          const guard = VetoGuard__factory.connect(safe.guard, signerOrProvider);
          const guardOwner = await guard.owner();
          if (guardOwner !== safe.address) {
            gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: guardOwner });
          }
        }
      } else {
        // Clearing the state
        gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: '' });
      }
    };

    const loadDaoNodes = async () => {
      if (safe.address && signerOrProvider && safeService) {
        const declaredSubDAOs = await fetchSubDAOs(safe.address);

        if (!declaredSubDAOs) {
          return;
        }

        const controlledSafes: string[] = [];

        for (const safeAddress of declaredSubDAOs) {
          // Fairly bad solution if DAO has dozens of SubDAOs and it goes deeper.
          // But we cannot "trust" completely to the SubDAODeclared event as anyone can declare any DAO as it's subDAO
          // So we need to verify guard to be sure.
          const safeInfo = (await safeService.getSafeInfo(safeAddress)) as SafeInfoWithGuard;
          if (safeInfo.guard === ethers.constants.AddressZero) {
            // Guard is not attached - seems like just gap in Safe API Service indexisng.
            // Still, need to cover this case
            controlledSafes.push(safeAddress);
          } else {
            const guard = VetoGuard__factory.connect(safeInfo.guard, signerOrProvider);
            const guardOwner = await guard.owner();
            if (guardOwner === safe.address) {
              controlledSafes.push(safeAddress);
            }
          }
        }

        gnosisDispatch({ type: GnosisAction.SET_DAO_CHILDREN, payload: controlledSafes });
      }
    };

    loadDaoParent();
    loadDaoNodes();
  }, [chainId, safe, modules, gnosisDispatch, signerOrProvider, safeService, fetchSubDAOs]);
}
