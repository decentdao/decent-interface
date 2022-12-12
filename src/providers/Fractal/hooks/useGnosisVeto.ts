import {
  UsulVetoGuard__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber, ethers } from 'ethers';
import { Dispatch, useEffect } from 'react';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction } from '../constants';
import { GnosisActions, GnosisModuleType, IGnosisModuleData, IGnosisVetoData } from '../types';

export function useGnosisVeto(
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
      const guardMasterCopyAddress = await getMasterCopyAddress(guardAddress);

      let guard: IGnosisVetoData;

      if (guardMasterCopyAddress === gnosisVetoGuardMasterCopyContract.address) {
        const vetoGuardContract = VetoGuard__factory.connect(guardAddress, signerOrProvider);
        const votingAddress = await vetoGuardContract.vetoVoting();
        const votingMasterCopyAddress = await getMasterCopyAddress(votingAddress);
        const vetoVotingType =
          votingMasterCopyAddress === vetoMultisigVotingMasterCopyContract.address
            ? VetoMultisigVoting__factory
            : VetoERC20Voting__factory;
        const vetoVotingContract = vetoVotingType.connect(votingAddress, signerOrProvider);
        guard = {
          vetoGuardContract: vetoGuardContract,
          vetoVotingContract: vetoVotingContract,
          freezeVotesThreshold: await vetoVotingContract.freezeVotesThreshold(),
          freezeProposalCreatedBlock: await vetoVotingContract.freezeProposalCreatedBlock(),
          freezeProposalVoteCount: await vetoVotingContract.freezeProposalVoteCount(),
          freezeProposalBlockDuration: await vetoVotingContract.freezeProposalBlockDuration(),
          freezeBlockDuration: await vetoVotingContract.freezeBlockDuration(),
          userHasFreezeVoted: await vetoVotingContract.userHasFreezeVoted(
            account,
            await vetoVotingContract.freezeProposalCreatedBlock()
          ),
          isFrozen: await vetoVotingContract.isFrozen(),
        };
      } else if (guardAddress === ethers.constants.AddressZero) {
        const usulModule = modules?.find(module => module.moduleType === GnosisModuleType.USUL);
        if (!usulModule || !usulModule.moduleContract) {
          return;
        }
        const usulGuardAddress = await usulModule.moduleContract.getGuard();
        const vetoGuardContract = UsulVetoGuard__factory.connect(
          usulGuardAddress,
          signerOrProvider
        );
        const votingAddress = await vetoGuardContract.vetoVoting();
        const votingMasterCopyAddress = await getMasterCopyAddress(votingAddress);
        const vetoVotingType =
          votingMasterCopyAddress === vetoMultisigVotingMasterCopyContract.address
            ? VetoMultisigVoting__factory
            : VetoERC20Voting__factory;
        const vetoVotingContract = vetoVotingType.connect(votingAddress, signerOrProvider);

        guard = {
          vetoGuardContract: vetoGuardContract,
          vetoVotingContract: vetoVotingContract,
          freezeVotesThreshold: await vetoVotingContract.freezeVotesThreshold(),
          freezeProposalCreatedBlock: await vetoVotingContract.freezeProposalCreatedBlock(),
          freezeProposalVoteCount: await vetoVotingContract.freezeProposalVoteCount(),
          freezeProposalBlockDuration: await vetoVotingContract.freezeProposalBlockDuration(),
          freezeBlockDuration: await vetoVotingContract.freezeBlockDuration(),
          userHasFreezeVoted: await vetoVotingContract.userHasFreezeVoted(
            account,
            await vetoVotingContract.freezeProposalCreatedBlock()
          ),
          isFrozen: await vetoVotingContract.isFrozen(),
        };
      } else {
        guard = {
          vetoGuardContract: undefined,
          vetoVotingContract: undefined,
          freezeVotesThreshold: BigNumber.from(0),
          freezeProposalCreatedBlock: BigNumber.from(0),
          freezeProposalVoteCount: BigNumber.from(0),
          freezeProposalBlockDuration: BigNumber.from(0),
          freezeBlockDuration: BigNumber.from(0),
          userHasFreezeVoted: false,
          isFrozen: false,
        };
      }

      gnosisDispatch({
        type: GnosisAction.SET_GUARD,
        payload: guard,
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
