import { useCallback, useEffect, useRef } from 'react';
import { getAddress, zeroAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { GuardContractAction } from '../../../providers/App/guardContracts/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeInfoResponseWithGuard, FreezeGuardType, FreezeVotingType } from '../../../types';
import useSafeContracts from '../../safe/useSafeContracts';
import useContractClient from '../../utils/useContractClient';
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
  const { publicClient } = useContractClient();

  const { chain } = useNetworkConfig();

  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();

  const loadFractalGuardContracts = useCallback(
    async (
      _daoAddress: string,
      _safe: SafeInfoResponseWithGuard,
      _fractalModules: FractalModuleData[],
    ) => {
      if (!baseContracts || !publicClient) {
        return;
      }
      const { azoriusFreezeGuardMasterCopyContract, multisigFreezeGuardMasterCopyContract } =
        baseContracts;
      const { guard } = _safe;

      let freezeGuardContract;
      let freezeGuardType: FreezeGuardType | null = null;

      const azoriusModule = _fractalModules?.find(
        module => module.moduleType === FractalModuleType.AZORIUS,
      );
      if (!!azoriusModule && azoriusModule.moduleContract) {
        const azoriusGuardAddress = await azoriusModule.moduleContract.read.getGuard();

        if (azoriusGuardAddress === zeroAddress) {
          return {
            freezeGuardContractAddress: undefined,
            freezeVotingContractAddress: undefined,
            freezeVotingType: null,
            freezeGuardType: null,
          };
        }
        freezeGuardContract = getContract({
          abi: azoriusFreezeGuardMasterCopyContract.asPublic.abi,
          address: azoriusGuardAddress! as Address,
          client: publicClient,
        });
        freezeGuardType = FreezeGuardType.AZORIUS;
      } else {
        if (guard) {
          const hasNoGuard = _safe.guard === zeroAddress;
          const masterCopyData = await getZodiacModuleProxyMasterCopyData(getAddress(guard));
          if (masterCopyData.isMultisigFreezeGuard && !hasNoGuard) {
            freezeGuardContract = {
              asSigner: multisigFreezeGuardMasterCopyContract.asSigner.attach(guard),
              asProvider: multisigFreezeGuardMasterCopyContract.asProvider.attach(guard),
            };
            freezeGuardType = FreezeGuardType.MULTISIG;
          }
        }
      }

      if (!!freezeGuardContract) {
        const votingAddress = await freezeGuardContract.asProvider.freezeVoting();
        const masterCopyData = await getZodiacModuleProxyMasterCopyData(getAddress(votingAddress));
        const freezeVotingType = masterCopyData.isMultisigFreezeVoting
          ? FreezeVotingType.MULTISIG
          : masterCopyData.isERC721FreezeVoting
            ? FreezeVotingType.ERC721
            : FreezeVotingType.ERC20;

        const contracts = {
          freezeGuardContractAddress: freezeGuardContract.address,
          freezeVotingContractAddress: votingAddress as Address,
          freezeVotingType,
          freezeGuardType,
        };

        return contracts;
      } else {
        return {
          freezeGuardContractAddress: undefined,
          freezeVotingContractAddress: undefined,
          freezeVotingType: null,
          freezeGuardType: null,
        };
      }
    },
    [baseContracts, getZodiacModuleProxyMasterCopyData, publicClient],
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
      daoAddress + chain.id !== loadKey.current &&
      isHierarchyLoaded &&
      safe
    ) {
      loadKey.current = daoAddress + chain.id;
      setGuardContracts();
    }

    if (!daoAddress) {
      loadKey.current = undefined;
    }
  }, [setGuardContracts, isHierarchyLoaded, loadOnMount, chain, daoAddress, safe]);
  return loadFractalGuardContracts;
};
