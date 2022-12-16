import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect } from 'react';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction } from '../constants';
import { GnosisActions, IGnosisFreezeData, IGnosisVetoContract, VetoVotingType } from '../types';
import { FreezeVoteCastedListener } from '../types/vetoVotingEvent';

export function useFreezeData(
  vetoGuardContract: IGnosisVetoContract,
  gnosisDispatch: Dispatch<GnosisActions>
) {
  const {
    state: { account, signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    (async () => {
      if (!vetoGuardContract || !vetoGuardContract.vetoVotingContract || !account) {
        return;
      }

      let freeze: IGnosisFreezeData;

      freeze = {
        freezeVotesThreshold: await vetoGuardContract.vetoVotingContract.freezeVotesThreshold(),
        freezeProposalCreatedTime:
          await vetoGuardContract.vetoVotingContract.freezeProposalCreatedTime(),
        freezeProposalVoteCount:
          await vetoGuardContract.vetoVotingContract.freezeProposalVoteCount(),
        freezeProposalPeriod: await vetoGuardContract.vetoVotingContract.freezeProposalPeriod(),
        freezePeriod: await vetoGuardContract.vetoVotingContract.freezePeriod(),
        userHasFreezeVoted: await vetoGuardContract.vetoVotingContract.userHasFreezeVoted(
          account,
          await vetoGuardContract.vetoVotingContract.freezeProposalCreatedBlock()
        ),
        isFrozen: await vetoGuardContract.vetoVotingContract.isFrozen(),
      };

      gnosisDispatch({
        type: GnosisAction.SET_FREEZE_DATA,
        payload: freeze,
      });
    })();
  }, [
    gnosisDispatch,
    signerOrProvider,
    account,
    vetoGuardContract,
    vetoGuardContract.vetoVotingContract,
  ]);

  useEffect(() => {
    if (
      !account ||
      vetoGuardContract.vetoVotingType !== VetoVotingType.MULTISIG ||
      !vetoGuardContract.vetoVotingContract
    ) {
      return;
    }

    const vetoVotingContract = vetoGuardContract.vetoVotingContract as VetoMultisigVoting;

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

    const vetoVotingContract = vetoGuardContract.vetoVotingContract as VetoERC20Voting;

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
}
