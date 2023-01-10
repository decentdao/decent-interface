import {
  GnosisSafe__factory,
  VetoERC20Voting,
  VetoMultisigVoting,
  VotesToken__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { Dispatch, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../helpers/freezePeriodHelpers';
import { GnosisAction } from '../constants';
import { GnosisActions, IGnosisFreezeData, IGnosisVetoContract, VetoVotingType } from '../types';
import { FreezeVoteCastedListener } from '../types/vetoVotingEvent';

export function useFreezeData(
  vetoGuardContract: IGnosisVetoContract,
  gnosisDispatch: Dispatch<GnosisActions>
) {
  const provider = useProvider();
  const { data } = useSigner();
  const signerOrProvider = useMemo(() => data || provider, [data, provider]);
  const { address } = useAccount();

  const lookupFreezeData = useCallback(
    async ({ vetoVotingType, vetoVotingContract }: IGnosisVetoContract) => {
      let userHasVotes: boolean = false;
      const freezeCreatedBlock = await (
        vetoVotingContract as VetoERC20Voting
      ).freezeProposalCreatedBlock();

      const freezeData = {
        freezeVotesThreshold: await vetoVotingContract!.freezeVotesThreshold(),
        freezeProposalCreatedTime: await vetoVotingContract!.freezeProposalCreatedTime(),
        freezeProposalVoteCount: await vetoVotingContract!.freezeProposalVoteCount(),
        freezeProposalPeriod: await vetoVotingContract!.freezeProposalPeriod(),
        freezePeriod: await vetoVotingContract!.freezePeriod(),
        userHasFreezeVoted: await vetoVotingContract!.userHasFreezeVoted(
          address || '',
          freezeCreatedBlock
        ),
        isFrozen: await vetoVotingContract!.isFrozen(),
      };

      if (vetoVotingType === VetoVotingType.MULTISIG) {
        const gnosisSafeContract = GnosisSafe__factory.connect(
          await (vetoVotingContract as VetoMultisigVoting).gnosisSafe(),
          signerOrProvider!
        );
        const owners = await gnosisSafeContract.getOwners();
        userHasVotes = owners.find(owner => owner === address) !== undefined;
      } else if (vetoVotingType === VetoVotingType.ERC20) {
        const votesTokenContract = VotesToken__factory.connect(
          await (vetoVotingContract as VetoERC20Voting).votesToken(),
          signerOrProvider!
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
              await votesTokenContract.getVotes(address || '')
            : // freeze is active
              await votesTokenContract.getPastVotes(address || '', freezeCreatedBlock)
        ).gt(0);
      }

      const freeze: IGnosisFreezeData = {
        ...freezeData,
        userHasVotes: userHasVotes,
      };
      return freeze;
    },
    [signerOrProvider, provider, address]
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
  }, [gnosisDispatch, vetoGuardContract, lookupFreezeData]);

  useEffect(() => {
    if (
      !address ||
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
          isVoter: voter === address,
          freezeProposalCreatedTime: await vetoVotingContract.freezeProposalCreatedTime(),
          freezeProposalVoteCount: await vetoVotingContract.freezeProposalVoteCount(),
        },
      });
    };

    vetoVotingContract.on(filter, listenerCallback);

    return () => {
      vetoVotingContract.off(filter, listenerCallback);
    };
  }, [address, vetoGuardContract, gnosisDispatch]);

  useEffect(() => {
    if (
      !address ||
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
          isVoter: voter === address,
          freezeProposalCreatedTime: await vetoVotingContract.freezeProposalCreatedTime(),
          freezeProposalVoteCount: await vetoVotingContract.freezeProposalVoteCount(),
        },
      });
    };

    vetoVotingContract.on(filter, listenerCallback);

    return () => {
      vetoVotingContract.off(filter, listenerCallback);
    };
  }, [address, vetoGuardContract, gnosisDispatch]);

  return { lookupFreezeData };
}
