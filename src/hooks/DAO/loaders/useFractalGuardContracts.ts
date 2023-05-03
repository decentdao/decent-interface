import {
  ModuleProxyFactory,
  AzoriusFreezeGuard,
  MultisigFreezeGuard,
} from '@fractal-framework/fractal-contracts';
import { constants } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { GuardContractAction } from '../../../providers/App/guardContracts/action';
import {
  ContractConnection,
  SafeInfoResponseWithGuard,
  FreezeGuardType,
  FreezeVotingType,
} from '../../../types';
import { FractalModuleData, FractalModuleType } from './../../../types/fractal';
export const useFractalGuardContracts = ({ loadOnMount = true }: { loadOnMount?: boolean }) => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();
  const {
    node: { daoAddress, safe, fractalModules },
    baseContracts: {
      zodiacModuleProxyFactoryContract,
      vetoERC20VotingMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      azoriusVetoGuardMasterCopyContract,
      gnosisVetoGuardMasterCopyContract,
    },
    action,
  } = useFractal();

  const {
    network: { chainId },
  } = useProvider();

  const getMasterCopyAddress = useCallback(
    async (proxyAddress: string): Promise<string> => {
      const filter = getEventRPC<ModuleProxyFactory>(
        zodiacModuleProxyFactoryContract,
        chainId
      ).filters.ModuleProxyCreation(proxyAddress, null);
      return getEventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract, chainId)
        .queryFilter(filter)
        .then(proxiesCreated => {
          if (proxiesCreated.length === 0) return constants.AddressZero;
          return proxiesCreated[0].args.masterCopy;
        });
    },
    [zodiacModuleProxyFactoryContract, chainId]
  );

  const loadFractalGuardContracts = useCallback(
    async (
      _daoAddress: string,
      _safe: SafeInfoResponseWithGuard,
      _fractalModules: FractalModuleData[]
    ) => {
      const { guard } = _safe;

      let vetoGuardContract:
        | ContractConnection<AzoriusFreezeGuard | MultisigFreezeGuard>
        | undefined;
      let freezeGuardType: FreezeGuardType | null = null;

      const azoriusModule = _fractalModules?.find(
        module => module.moduleType === FractalModuleType.AZORIUS
      );
      if (!!azoriusModule && azoriusModule.moduleContract) {
        const azoriusGuardAddress = await azoriusModule.moduleContract.getGuard();
        if (azoriusGuardAddress === constants.AddressZero) return;
        vetoGuardContract = {
          asSigner: azoriusVetoGuardMasterCopyContract.asSigner.attach(azoriusGuardAddress),
          asProvider: azoriusVetoGuardMasterCopyContract.asProvider.attach(azoriusGuardAddress),
        };
        freezeGuardType = FreezeGuardType.AZORIUS;
      } else {
        const hasNoGuard = _safe.guard === constants.AddressZero;
        const guardMasterCopyAddress = await getMasterCopyAddress(guard!);
        const isGnosisGuard =
          guardMasterCopyAddress === gnosisVetoGuardMasterCopyContract.asSigner.address;
        if (isGnosisGuard && !hasNoGuard) {
          vetoGuardContract = {
            asSigner: gnosisVetoGuardMasterCopyContract.asSigner.attach(guard!),
            asProvider: gnosisVetoGuardMasterCopyContract.asProvider.attach(guard!),
          };
          freezeGuardType = FreezeGuardType.MULTISIG;
        }
      }

      if (!!vetoGuardContract) {
        const votingAddress = await vetoGuardContract.asSigner.freezeVoting();
        const votingMasterCopyAddress = await getMasterCopyAddress(votingAddress);
        const vetoVotingType =
          votingMasterCopyAddress === vetoMultisigVotingMasterCopyContract.asSigner.address
            ? FreezeVotingType.MULTISIG
            : FreezeVotingType.ERC20;

        const vetoVotingContract =
          vetoVotingType === FreezeVotingType.MULTISIG
            ? {
                asSigner: vetoMultisigVotingMasterCopyContract.asSigner.attach(votingAddress),
                asProvider: vetoMultisigVotingMasterCopyContract.asProvider.attach(votingAddress),
              }
            : {
                asSigner: vetoERC20VotingMasterCopyContract.asSigner.attach(votingAddress),
                asProvider: vetoERC20VotingMasterCopyContract.asProvider.attach(votingAddress),
              };

        const contracts = {
          vetoGuardContract: vetoGuardContract,
          vetoVotingContract: vetoVotingContract,
          vetoVotingType,
          freezeGuardType,
        };
        return contracts;
      }
    },
    [
      getMasterCopyAddress,
      vetoERC20VotingMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      azoriusVetoGuardMasterCopyContract,
      gnosisVetoGuardMasterCopyContract,
    ]
  );

  const setGuardContracts = useCallback(async () => {
    if (!daoAddress || !safe || !fractalModules.length || !safe.guard) return;
    const contracts = await loadFractalGuardContracts(daoAddress, safe, fractalModules);
    if (!contracts) return;
    action.dispatch({ type: GuardContractAction.SET_GUARD_CONTRACT, payload: contracts });
  }, [action, daoAddress, safe, fractalModules, loadFractalGuardContracts]);

  useEffect(() => {
    if (daoAddress && daoAddress !== currentValidAddress.current && loadOnMount) {
      currentValidAddress.current = daoAddress;
      setGuardContracts();
    }
  }, [setGuardContracts, daoAddress, loadOnMount]);
  return loadFractalGuardContracts;
};
