import { VetoGuard__factory } from '@fractal-framework/fractal-contracts';
import { SafeInfoResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { Dispatch, useEffect } from 'react';
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
  const { modules, safe, safeService } = gnosis;
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
        const ownedSafesResponse = await safeService.getSafesByOwner(safe.address);
        const ownedSafes = ownedSafesResponse.safes;
        const controlledSafes: string[] = [];

        for (const safeAddress of ownedSafes) {
          // Fairly bad solution if DAO has dozens of SubDAOs. But there could be the case when guard is changed, but signer is not.
          // Then the DAO is actually "lost" - but it will be up to child DAO to create proper proposal to replace old DAO from signers list with new parent DAO.
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
  }, [chainId, safe, modules, gnosisDispatch, signerOrProvider, safeService]);
}
