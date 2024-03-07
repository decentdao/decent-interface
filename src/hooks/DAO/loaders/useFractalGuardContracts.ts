import { AzoriusFreezeGuard, MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import { constants } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GuardContractAction } from '../../../providers/App/guardContracts/action';
import {
  ContractConnection,
  SafeInfoResponseWithGuard,
  FreezeGuardType,
  FreezeVotingType,
} from '../../../types';
import { useEthersProvider } from '../../utils/useEthersProvider';
import { useMasterCopy } from '../../utils/useMasterCopy';
import { FractalModuleData, FractalModuleType } from './../../../types/fractal';
export const useFractalGuardContracts = ({ loadOnMount = true }: { loadOnMount?: boolean }) => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();
  const {
    node: { daoAddress, safe, fractalModules, isModulesLoaded },
    baseContracts: {
      freezeERC20VotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      multisigFreezeGuardMasterCopyContract,
    },
    action,
  } = useFractal();

  const {
    network: { chainId },
  } = useEthersProvider();

  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();

  const loadFractalGuardContracts = useCallback(
    async (
      _daoAddress: string,
      _safe: SafeInfoResponseWithGuard,
      _fractalModules: FractalModuleData[]
    ) => {
      const { guard } = _safe;

      let freezeGuardContract:
        | ContractConnection<AzoriusFreezeGuard | MultisigFreezeGuard>
        | undefined;
      let freezeGuardType: FreezeGuardType | null = null;

      const azoriusModule = _fractalModules?.find(
        module => module.moduleType === FractalModuleType.AZORIUS
      );
      if (!!azoriusModule && azoriusModule.moduleContract) {
        const azoriusGuardAddress = await azoriusModule.moduleContract.getGuard();
        if (azoriusGuardAddress === constants.AddressZero) return;
        freezeGuardContract = {
          asSigner: azoriusFreezeGuardMasterCopyContract.asSigner.attach(azoriusGuardAddress),
          asProvider: azoriusFreezeGuardMasterCopyContract.asProvider.attach(azoriusGuardAddress),
        };
        freezeGuardType = FreezeGuardType.AZORIUS;
      } else {
        const hasNoGuard = _safe.guard === constants.AddressZero;
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

        const freezeVotingContract =
          freezeVotingType === FreezeVotingType.MULTISIG
            ? {
                asSigner: freezeMultisigVotingMasterCopyContract.asSigner.attach(votingAddress),
                asProvider: freezeMultisigVotingMasterCopyContract.asProvider.attach(votingAddress),
              }
            : freezeVotingType === FreezeVotingType.ERC721
            ? {
                asSigner: freezeERC721VotingMasterCopyContract.asSigner.attach(votingAddress),
                asProvider: freezeERC721VotingMasterCopyContract.asProvider.attach(votingAddress),
              }
            : {
                asSigner: freezeERC20VotingMasterCopyContract.asSigner.attach(votingAddress),
                asProvider: freezeERC20VotingMasterCopyContract.asProvider.attach(votingAddress),
              };

        const contracts = {
          freezeGuardContract,
          freezeVotingContract,
          freezeVotingType,
          freezeGuardType,
        };

        return contracts;
      }
    },
    [
      freezeERC20VotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      multisigFreezeGuardMasterCopyContract,
      getZodiacModuleProxyMasterCopyData,
    ]
  );

  const setGuardContracts = useCallback(async () => {
    if (!daoAddress || !safe || !fractalModules.length || !safe.guard) return;
    const contracts = await loadFractalGuardContracts(daoAddress, safe, fractalModules);
    if (!contracts) return;
    action.dispatch({ type: GuardContractAction.SET_GUARD_CONTRACT, payload: contracts });
  }, [action, daoAddress, safe, fractalModules, loadFractalGuardContracts]);

  useEffect(() => {
    if (daoAddress && chainId + daoAddress !== loadKey.current && loadOnMount && isModulesLoaded) {
      loadKey.current = chainId + daoAddress;
      setGuardContracts();
    }
    if (!daoAddress) {
      loadKey.current = undefined;
    }
  }, [setGuardContracts, isModulesLoaded, daoAddress, loadOnMount, chainId]);
  return loadFractalGuardContracts;
};
