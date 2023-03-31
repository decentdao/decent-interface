import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { FreezeVoteCastEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/VetoERC20Voting';
import { BigNumber, constants } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import {
  isWithinFreezeProposalPeriod,
  isWithinFreezePeriod,
} from '../../../helpers/freezePeriodHelpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGuardAction } from '../../../providers/App/guard/action';
import { ContractConnection, FractalGuardContracts, VetoVotingType } from '../../../types';
import { FreezeGuard } from './../../../types/fractal';

export const useFractalFreeze = ({ loadOnMount = true }: { loadOnMount?: boolean }) => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();
  const isFreezeSet = useRef(false);

  const {
    node: { daoAddress },
    baseContracts: { votesTokenMasterCopyContract, gnosisSafeSingletonContract },
    guardContracts,
    dispatch,
  } = useFractal();

  const { address: account } = useAccount();
  const provider = useProvider();
  const {
    network: { chainId },
  } = provider;

  const loadFractalFreezeGuard = useCallback(
    async ({ vetoVotingContract, vetoVotingType }: FractalGuardContracts) => {
      if (vetoVotingType == null || !vetoVotingContract) return;
      let userHasVotes: boolean = false;
      const freezeCreatedBlock = await (
        vetoVotingContract!.asSigner as VetoERC20Voting
      ).freezeProposalCreatedBlock();

      const freezeVotesThreshold = await vetoVotingContract!.asSigner.freezeVotesThreshold();
      const freezeProposalCreatedTime =
        await vetoVotingContract!.asSigner.freezeProposalCreatedTime();
      const freezeProposalVoteCount = await vetoVotingContract!.asSigner.freezeProposalVoteCount();
      const freezeProposalPeriod = await vetoVotingContract!.asSigner.freezeProposalPeriod();
      const freezePeriod = await vetoVotingContract!.asSigner.freezePeriod();
      const userHasFreezeVoted = await vetoVotingContract!.asSigner.userHasFreezeVoted(
        account || constants.AddressZero,
        freezeCreatedBlock
      );
      const isFrozen = await vetoVotingContract!.asSigner.isFrozen();

      const freezeGuard = {
        freezeVotesThreshold,
        freezeProposalCreatedTime,
        freezeProposalVoteCount,
        freezeProposalPeriod,
        freezePeriod,
        userHasFreezeVoted,
        isFrozen,
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
            freezeGuard.freezeProposalCreatedTime,
            freezeGuard.freezeProposalPeriod,
            BigNumber.from(currentTimestamp)
          ) ||
          isWithinFreezePeriod(
            freezeGuard.freezeProposalCreatedTime,
            freezeGuard.freezePeriod,
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

      const freeze: FreezeGuard = {
        ...freezeGuard,
        userHasVotes,
      };
      isFreezeSet.current = true;
      currentValidAddress.current = vetoVotingContract.asSigner.address;
      return freeze;
    },
    [account, provider, gnosisSafeSingletonContract, votesTokenMasterCopyContract]
  );

  const setFractalFreezeGuard = useCallback(
    async (_guardContracts: FractalGuardContracts) => {
      const freezeGuard = await loadFractalFreezeGuard(_guardContracts);
      if (freezeGuard) {
        dispatch.guard({ type: FractalGuardAction.SET_FREEZE_GUARD, payload: freezeGuard });
      }
    },
    [dispatch, loadFractalFreezeGuard]
  );

  useEffect(() => {
    if (
      !!guardContracts.vetoVotingType &&
      !!guardContracts.vetoVotingContract &&
      guardContracts.vetoVotingContract.asSigner.address !== currentValidAddress.current &&
      loadOnMount
    ) {
      setFractalFreezeGuard(guardContracts);
    }
  }, [setFractalFreezeGuard, guardContracts, daoAddress, loadOnMount]);

  useEffect(() => {
    if (!loadOnMount) return;
    const { vetoVotingContract, vetoVotingType } = guardContracts;
    let votingRPC: VetoMultisigVoting | VetoERC20Voting;
    const listenerCallback: TypedListener<FreezeVoteCastEvent> = async (
      voter: string,
      votesCast
    ) => {
      dispatch.guard({
        type: FractalGuardAction.UPDATE_FREEZE_VOTE,
        payload: {
          isVoter: voter === account,
          freezeProposalCreatedTime: await votingRPC.freezeProposalCreatedTime(),
          votesCast,
        },
      });
    };

    if (isFreezeSet.current && vetoVotingType !== null && vetoVotingContract) {
      if (vetoVotingType === VetoVotingType.MULTISIG) {
        votingRPC = getEventRPC<VetoMultisigVoting>(
          vetoVotingContract as ContractConnection<VetoMultisigVoting>,
          chainId
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      } else if (vetoVotingType === VetoVotingType.ERC20) {
        votingRPC = getEventRPC<VetoERC20Voting>(
          vetoVotingContract as ContractConnection<VetoERC20Voting>,
          chainId
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      }
    }
  }, [guardContracts, chainId, account, dispatch, loadOnMount]);
  return loadFractalFreezeGuard;
};
