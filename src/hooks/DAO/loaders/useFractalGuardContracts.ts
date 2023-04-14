import { ModuleProxyFactory, UsulVetoGuard, VetoGuard } from '@fractal-framework/fractal-contracts';
import { constants } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { GuardContractAction } from '../../../providers/App/guardContracts/action';
import {
  ContractConnection,
  SafeInfoResponseWithGuard,
  VetoGuardType,
  VetoVotingType,
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
      usulVetoGuardMasterCopyContract,
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

      let vetoGuardContract: ContractConnection<UsulVetoGuard | VetoGuard> | undefined;
      let vetoGuardType: VetoGuardType | null = null;

      const usulModule = _fractalModules?.find(
        module => module.moduleType === FractalModuleType.USUL
      );
      if (!!usulModule && usulModule.moduleContract) {
        const usulGuardAddress = await usulModule.moduleContract.getGuard();
        if (usulGuardAddress === constants.AddressZero) return;
        vetoGuardContract = {
          asSigner: usulVetoGuardMasterCopyContract.asSigner.attach(usulGuardAddress),
          asProvider: usulVetoGuardMasterCopyContract.asProvider.attach(usulGuardAddress),
        };
        vetoGuardType = VetoGuardType.USUL;
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
          vetoGuardType = VetoGuardType.MULTISIG;
        }
      }

      if (!!vetoGuardContract) {
        const votingAddress = await vetoGuardContract.asSigner.vetoVoting();
        const votingMasterCopyAddress = await getMasterCopyAddress(votingAddress);
        const vetoVotingType =
          votingMasterCopyAddress === vetoMultisigVotingMasterCopyContract.asSigner.address
            ? VetoVotingType.MULTISIG
            : VetoVotingType.ERC20;

        const vetoVotingContract =
          vetoVotingType === VetoVotingType.MULTISIG
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
          vetoGuardType,
        };
        return contracts;
      }
    },
    [
      getMasterCopyAddress,
      vetoERC20VotingMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      usulVetoGuardMasterCopyContract,
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
