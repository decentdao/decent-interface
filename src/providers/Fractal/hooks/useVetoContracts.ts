import {
  UsulVetoGuard__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { Dispatch, useEffect } from 'react';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction } from '../constants';
import {
  GnosisActions,
  GnosisModuleType,
  IGnosisModuleData,
  IGnosisVetoContract,
  VetoVotingType,
} from '../types';

export function useVetoContracts(
  gnosisDispatch: Dispatch<GnosisActions>,
  guardAddress?: string,
  modules?: IGnosisModuleData[]
) {
  const {
    state: { signerOrProvider, account },
  } = useWeb3Provider();

  const {
    zodiacModuleProxyFactoryContract,
    vetoERC20VotingMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    gnosisVetoGuardMasterCopyContract,
  } = useSafeContracts();

  useEffect(() => {
    if (
      !zodiacModuleProxyFactoryContract ||
      !guardAddress ||
      !signerOrProvider ||
      !account ||
      !gnosisVetoGuardMasterCopyContract ||
      !usulVetoGuardMasterCopyContract ||
      !vetoMultisigVotingMasterCopyContract ||
      !vetoERC20VotingMasterCopyContract
    ) {
      return;
    }

    const getMasterCopyAddress = (proxyAddress: string): Promise<string> => {
      const filter = zodiacModuleProxyFactoryContract.filters.ModuleProxyCreation(
        proxyAddress,
        null
      );

      return zodiacModuleProxyFactoryContract.queryFilter(filter).then(proxiesCreated => {
        return proxiesCreated[0].args.masterCopy;
      });
    };

    (async () => {
      let contracts: IGnosisVetoContract;
      let vetoGuardContract;

      if (
        guardAddress !== ethers.constants.AddressZero &&
        (await getMasterCopyAddress(guardAddress)) === gnosisVetoGuardMasterCopyContract.address
      ) {
        vetoGuardContract = VetoGuard__factory.connect(guardAddress, signerOrProvider);
      } else {
        const usulModule = modules?.find(module => module.moduleType === GnosisModuleType.USUL);
        if (
          !usulModule ||
          !usulModule.moduleContract ||
          (await usulModule.moduleContract.getGuard()) === ethers.constants.AddressZero
        ) {
          return;
        }
        const usulGuardAddress = await usulModule.moduleContract.getGuard();
        vetoGuardContract = UsulVetoGuard__factory.connect(usulGuardAddress, signerOrProvider);
      }

      const votingAddress = await vetoGuardContract.vetoVoting();
      const votingMasterCopyAddress = await getMasterCopyAddress(votingAddress);
      const vetoVotingType =
        votingMasterCopyAddress === vetoMultisigVotingMasterCopyContract.address
          ? VetoMultisigVoting__factory
          : VetoERC20Voting__factory;
      const vetoVotingContract = vetoVotingType.connect(votingAddress, signerOrProvider);

      contracts = {
        vetoGuardContract: vetoGuardContract,
        vetoVotingContract: vetoVotingContract,
        vetoVotingType:
          vetoVotingType === VetoMultisigVoting__factory
            ? VetoVotingType.MULTISIG
            : VetoVotingType.ERC20,
      };

      gnosisDispatch({
        type: GnosisAction.SET_GUARD_CONTRACTS,
        payload: contracts,
      });
    })();
  }, [
    zodiacModuleProxyFactoryContract,
    gnosisVetoGuardMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    vetoERC20VotingMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    guardAddress,
    modules,
    gnosisDispatch,
    signerOrProvider,
    account,
  ]);
}
