import { AzoriusFreezeGuard, MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { zeroAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { GuardContractAction } from '../../../providers/App/guardContracts/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  ContractConnection,
  SafeInfoResponseWithGuard,
  FreezeGuardType,
  FreezeVotingType,
} from '../../../types';
import useSafeContracts from '../../safe/useSafeContracts';
import { useMasterCopy } from '../../utils/useMasterCopy';
import { FractalModuleData, FractalModuleType } from './../../../types/fractal';

export const useFractalGuardContracts = ({ loadOnMount = true }: { loadOnMount?: boolean }) => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();
  const {
    node: { daoAddress, safe, fractalModules, isHierarchyLoaded },
    action,
  } = useFractal();
  const baseContracts = useSafeContracts();

  const { chainId } = useNetworkConfig();

  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();

  const loadFractalGuardContracts = useCallback(
    async (
      _daoAddress: string,
      _safe: SafeInfoResponseWithGuard,
      _fractalModules: FractalModuleData[],
    ) => {
      if (!baseContracts) {
        return;
      }
      const { azoriusFreezeGuardMasterCopyContract, multisigFreezeGuardMasterCopyContract } =
        baseContracts;
      const { guard } = _safe;

      let freezeGuardContract:
        | ContractConnection<AzoriusFreezeGuard | MultisigFreezeGuard>
        | undefined;
      let freezeGuardType: FreezeGuardType | null = null;

      const azoriusModule = _fractalModules?.find(
        module => module.moduleType === FractalModuleType.AZORIUS,
      );
      if (!!azoriusModule && azoriusModule.moduleContract) {
        const azoriusGuardAddress = await azoriusModule.moduleContract.getGuard();

        if (azoriusGuardAddress === zeroAddress) {
          return {
            freezeGuardContractAddress: '',
            freezeVotingContractAddress: '',
            freezeVotingType: null,
            freezeGuardType: null,
          };
        }

        freezeGuardContract = {
          asSigner: azoriusFreezeGuardMasterCopyContract.asSigner.attach(azoriusGuardAddress),
          asProvider: azoriusFreezeGuardMasterCopyContract.asProvider.attach(azoriusGuardAddress),
        };
        freezeGuardType = FreezeGuardType.AZORIUS;
      } else {
        const hasNoGuard = _safe.guard === zeroAddress;
        const masterCopyData = await getZodiacModuleProxyMasterCopyData(guard!);
        if (masterCopyData.isMultisigFreezeGuard && !hasNoGuard) {
          freezeGuardContract = {
            asSigner: multisigFreezeGuardMasterCopyContract.asSigner.attach(guard!),
            asProvider: multisigFreezeGuardMasterCopyContract.asProvider.attach(guard!),
          };
          freezeGuardType = FreezeGuardType.MULTISIG;
        }
      }

      if (!!freezeGuardContract) {
        const votingAddress = await freezeGuardContract.asProvider.freezeVoting();
        const masterCopyData = await getZodiacModuleProxyMasterCopyData(votingAddress);
        const freezeVotingType = masterCopyData.isMultisigFreezeVoting
          ? FreezeVotingType.MULTISIG
          : masterCopyData.isERC721FreezeVoting
            ? FreezeVotingType.ERC721
            : FreezeVotingType.ERC20;

        const contracts = {
          freezeGuardContractAddress: freezeGuardContract.asProvider.address,
          freezeVotingContractAddress: votingAddress,
          freezeVotingType,
          freezeGuardType,
        };

        return contracts;
      } else {
        return {
          freezeGuardContractAddress: '',
          freezeVotingContractAddress: '',
          freezeVotingType: null,
          freezeGuardType: null,
        };
      }
    },
    [baseContracts, getZodiacModuleProxyMasterCopyData],
  );

  const setGuardContracts = useCallback(async () => {
    if (!daoAddress || !safe) return;
    const contracts = await loadFractalGuardContracts(daoAddress, safe, fractalModules);
    if (!contracts) return;
    action.dispatch({ type: GuardContractAction.SET_GUARD_CONTRACT, payload: contracts });
  }, [action, daoAddress, safe, fractalModules, loadFractalGuardContracts]);

  useEffect(() => {
    if (
      loadOnMount &&
      daoAddress &&
      daoAddress + chainId !== loadKey.current &&
      isHierarchyLoaded &&
      safe
    ) {
      loadKey.current = daoAddress + chainId;
      setGuardContracts();
    }

    if (!daoAddress) {
      loadKey.current = undefined;
    }
  }, [setGuardContracts, isHierarchyLoaded, loadOnMount, chainId, daoAddress, safe]);
  return loadFractalGuardContracts;
};
