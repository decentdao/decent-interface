import { ModuleProxyFactory, UsulVetoGuard, VetoGuard } from '@fractal-framework/fractal-contracts';
import { constants } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { GuardContractAction } from '../../../providers/App/guardContracts/action';
import { ContractConnection, VetoGuardType, VetoVotingType } from '../../../types';
import { FractalModuleType } from './../../../types/fractal';
export const useFractalGuardContracts = () => {
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
    dispatch,
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
          return proxiesCreated[0].args.masterCopy;
        });
    },
    [zodiacModuleProxyFactoryContract, chainId]
  );

  const loadFractalGuardContracts = useCallback(async () => {
    if (!daoAddress || !safe || !fractalModules.length || !safe.guard) return;
    const { guard } = safe;
    currentValidAddress.current = daoAddress;

    let vetoGuardContract: ContractConnection<UsulVetoGuard | VetoGuard> | undefined;
    let vetoGuardType: VetoGuardType | null = null;

    const usulModule = fractalModules?.find(module => module.moduleType === FractalModuleType.USUL);
    if (!!usulModule && usulModule.moduleContract) {
      const usulGuardAddress = await usulModule.moduleContract.getGuard();
      if (usulGuardAddress === constants.AddressZero) return;
      vetoGuardContract = {
        asSigner: usulVetoGuardMasterCopyContract.asSigner.attach(usulGuardAddress),
        asProvider: usulVetoGuardMasterCopyContract.asProvider.attach(usulGuardAddress),
      };
      vetoGuardType = VetoGuardType.USUL;
    } else {
      const hasNoGuard = safe.guard === constants.AddressZero;
      const guardMasterCopyAddress = await getMasterCopyAddress(guard);
      const isGnosisGuard =
        guardMasterCopyAddress === gnosisVetoGuardMasterCopyContract.asSigner.address;
      if (isGnosisGuard && !hasNoGuard) {
        vetoGuardContract = {
          asSigner: gnosisVetoGuardMasterCopyContract.asSigner.attach(guard),
          asProvider: gnosisVetoGuardMasterCopyContract.asProvider.attach(guard),
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

      dispatch.guardContracts({ type: GuardContractAction.SET_GUARD_CONTRACT, payload: contracts });
    }
  }, [
    dispatch,
    daoAddress,
    safe,
    fractalModules,
    getMasterCopyAddress,
    vetoERC20VotingMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    gnosisVetoGuardMasterCopyContract,
  ]);

  useEffect(() => {
    if (daoAddress !== currentValidAddress.current) {
      loadFractalGuardContracts();
    }
  }, [loadFractalGuardContracts, daoAddress]);
  return;
};
