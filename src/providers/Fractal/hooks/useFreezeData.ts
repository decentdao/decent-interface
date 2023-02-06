import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { Dispatch, useEffect, useCallback } from 'react';
import { useAccount, useProvider } from 'wagmi';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../helpers/freezePeriodHelpers';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { GnosisAction } from '../constants';
import { GnosisActions, IGnosisFreezeData, IGnosisVetoContract, VetoVotingType } from '../types';
import { FreezeVoteCastedListener } from '../types/vetoVotingEvent';

export function useFreezeData(
  vetoGuardContract: IGnosisVetoContract,
  gnosisDispatch: Dispatch<GnosisActions>
) {
  const provider = useProvider();
  const { gnosisSafeSingletonContract, votesTokenMasterCopyContract } = useSafeContracts();
  const { address: account } = useAccount();

  const lookupFreezeData = useCallback(
    async ({ vetoVotingType, vetoVotingContract }: IGnosisVetoContract) => {
      let userHasVotes: boolean = false;
      const freezeCreatedBlock = await (
        vetoVotingContract!.asSigner as VetoERC20Voting
      ).freezeProposalCreatedBlock();

      const freezeData = {
        freezeVotesThreshold: await vetoVotingContract!.asSigner.freezeVotesThreshold(),
        freezeProposalCreatedTime: await vetoVotingContract!.asSigner.freezeProposalCreatedTime(),
        freezeProposalVoteCount: await vetoVotingContract!.asSigner.freezeProposalVoteCount(),
        freezeProposalPeriod: await vetoVotingContract!.asSigner.freezeProposalPeriod(),
        freezePeriod: await vetoVotingContract!.asSigner.freezePeriod(),
        userHasFreezeVoted: await vetoVotingContract!.asSigner.userHasFreezeVoted(
          account || '',
          freezeCreatedBlock
        ),
        isFrozen: await vetoVotingContract!.asSigner.isFrozen(),
      };

      if (vetoVotingType === VetoVotingType.MULTISIG) {
        const gnosisSafeContract = gnosisSafeSingletonContract!.asSigner.attach(
          await (vetoVotingContract!.asSigner as VetoMultisigVoting).gnosisSafe()
        );
        const owners = await gnosisSafeContract.getOwners();
        userHasVotes = owners.find(owner => owner === account) !== undefined;
      } else if (vetoVotingType === VetoVotingType.ERC20) {
        const votesTokenContract = votesTokenMasterCopyContract!.asSigner.attach(
          await (vetoVotingContract!.asSigner as VetoERC20Voting).votesToken()
        );
        const currentBlockNumber = await provider!.getBlockNumber();
        const currentTimestamp = (await provider!.getBlock(currentBlockNumber)).timestamp;
        const isFreezeActive =
          isWithinFreezeProposalPeriod(
            freezeData.freezeProposalCreatedTime,
            freezeData.freezeProposalPeriod,
            BigNumber.from(currentTimestamp)
          ) ||
          isWithinFreezePeriod(
            freezeData.freezeProposalCreatedTime,
            freezeData.freezePeriod,
            BigNumber.from(currentTimestamp)
          );
        userHasVotes = (
          !isFreezeActive
            ? // freeze not active
              await votesTokenContract.getVotes(account || '')
            : // freeze is active
              await votesTokenContract.getPastVotes(account || '', freezeCreatedBlock)
        ).gt(0);
      }

      const freeze: IGnosisFreezeData = {
        ...freezeData,
        userHasVotes: userHasVotes,
      };
      return freeze;
    },
    [provider, account, gnosisSafeSingletonContract, votesTokenMasterCopyContract]
  );

  useEffect(() => {
    (async () => {
      if (!vetoGuardContract.vetoVotingContract) {
        return;
      }

      lookupFreezeData(vetoGuardContract).then(freezeData => {
        gnosisDispatch({
          type: GnosisAction.SET_FREEZE_DATA,
          payload: freezeData,
        });
      });
    })();
  }, [gnosisDispatch, , vetoGuardContract, lookupFreezeData]);

  useEffect(() => {
    if (
      !account ||
      vetoGuardContract.vetoVotingType !== VetoVotingType.MULTISIG ||
      !vetoGuardContract.vetoVotingContract
    ) {
      return;
    }

    const vetoVotingContract = vetoGuardContract.vetoVotingContract.asSigner as VetoMultisigVoting;

    const filter = vetoVotingContract.filters.FreezeVoteCast();

    const listenerCallback: FreezeVoteCastedListener = async (voter: string) => {
      gnosisDispatch({
        type: GnosisAction.FREEZE_VOTE_EVENT,
        payload: {
          isVoter: voter === account,
          freezeProposalCreatedTime: await vetoVotingContract.freezeProposalCreatedTime(),
          freezeProposalVoteCount: await vetoVotingContract.freezeProposalVoteCount(),
        },
      });
    };

    vetoVotingContract.on(filter, listenerCallback);

    return () => {
      vetoVotingContract.off(filter, listenerCallback);
    };
  }, [account, vetoGuardContract, gnosisDispatch]);

  useEffect(() => {
    if (
      !account ||
      vetoGuardContract.vetoVotingType !== VetoVotingType.ERC20 ||
      !vetoGuardContract.vetoVotingContract
    ) {
      return;
    }

    const vetoVotingContract = vetoGuardContract.vetoVotingContract.asSigner as VetoERC20Voting;

    const filter = vetoVotingContract.filters.FreezeVoteCast();

    const listenerCallback: FreezeVoteCastedListener = async (voter: string) => {
      gnosisDispatch({
        type: GnosisAction.FREEZE_VOTE_EVENT,
        payload: {
          isVoter: voter === account,
          freezeProposalCreatedTime: await vetoVotingContract.freezeProposalCreatedTime(),
          freezeProposalVoteCount: await vetoVotingContract.freezeProposalVoteCount(),
        },
      });
    };

    vetoVotingContract.on(filter, listenerCallback);

    return () => {
      vetoVotingContract.off(filter, listenerCallback);
    };
  }, [account, vetoGuardContract, gnosisDispatch]);

  return { lookupFreezeData };
}
