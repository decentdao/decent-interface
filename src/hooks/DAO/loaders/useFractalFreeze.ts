import { ERC20FreezeVoting, MultisigFreezeVoting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { FreezeVoteCastEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/ERC20FreezeVoting';
import { BigNumber, constants } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import {
  isWithinFreezeProposalPeriod,
  isWithinFreezePeriod,
} from '../../../helpers/freezePeriodHelpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGuardAction } from '../../../providers/App/guard/action';
import { ContractConnection, FractalGuardContracts, FreezeVotingType } from '../../../types';
import { blocksToSeconds, getTimeStamp } from '../../../utils/contract';
import { FreezeGuard } from './../../../types/fractal';

export const useFractalFreeze = ({ loadOnMount = true }: { loadOnMount?: boolean }) => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();
  const isFreezeSet = useRef(false);

  const {
    node: { daoAddress },
    baseContracts: { votesTokenMasterCopyContract, safeSingletonContract },
    guardContracts,
    action,
    readOnly: { user },
  } = useFractal();

  const account = user.address;
  const provider = useProvider();
  const {
    network: { chainId },
  } = provider;

  const loadFractalFreezeGuard = useCallback(
    async ({ freezeVotingContract, freezeVotingType: freezeVotingType }: FractalGuardContracts) => {
      if (freezeVotingType == null || !freezeVotingContract) return;
      let userHasVotes: boolean = false;
      const freezeCreatedBlock = await (
        freezeVotingContract!.asSigner as ERC20FreezeVoting
      ).freezeProposalCreatedBlock();

      const freezeVotesThreshold = await freezeVotingContract!.asSigner.freezeVotesThreshold();
      const freezeProposalCreatedBlock =
        await freezeVotingContract!.asSigner.freezeProposalCreatedBlock();
      const freezeProposalCreatedTime = await getTimeStamp(freezeProposalCreatedBlock, provider);
      const freezeProposalVoteCount =
        await freezeVotingContract!.asSigner.freezeProposalVoteCount();
      const freezeProposalBlock = await freezeVotingContract!.asSigner.freezeProposalPeriod();
      // length of time to vote on freeze
      const freezeProposalPeriod = await blocksToSeconds(freezeProposalBlock, provider);
      const freezePeriodBlock = await freezeVotingContract!.asSigner.freezePeriod();
      // length of time frozen for in seconds
      const freezePeriod = await blocksToSeconds(freezePeriodBlock, provider);

      const userHasFreezeVoted = await freezeVotingContract!.asSigner.userHasFreezeVoted(
        account || constants.AddressZero,
        freezeCreatedBlock
      );
      const isFrozen = await freezeVotingContract!.asSigner.isFrozen();

      const freezeGuard = {
        freezeVotesThreshold,
        freezeProposalCreatedTime: BigNumber.from(freezeProposalCreatedTime),
        freezeProposalVoteCount,
        freezeProposalPeriod: BigNumber.from(freezeProposalPeriod),
        freezePeriod: BigNumber.from(freezePeriod),
        userHasFreezeVoted,
        isFrozen,
      };

      if (freezeVotingType === FreezeVotingType.MULTISIG) {
        const safeContract = safeSingletonContract!.asSigner.attach(
          await (freezeVotingContract!.asSigner as MultisigFreezeVoting).parentGnosisSafe()
        );
        const owners = await safeContract.getOwners();
        userHasVotes = owners.find(owner => owner === account) !== undefined;
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        const votesTokenContract = votesTokenMasterCopyContract!.asSigner.attach(
          await (freezeVotingContract!.asSigner as ERC20FreezeVoting).votesERC20()
        );
        const currentTimestamp = await getTimeStamp('latest', provider);
        const isFreezeActive =
          isWithinFreezeProposalPeriod(
            BigNumber.from(freezeGuard.freezeProposalCreatedTime),
            BigNumber.from(freezeGuard.freezeProposalPeriod),
            BigNumber.from(currentTimestamp)
          ) ||
          isWithinFreezePeriod(
            BigNumber.from(freezeGuard.freezeProposalCreatedTime),
            BigNumber.from(freezeGuard.freezePeriod),
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
      return freeze;
    },
    [account, provider, safeSingletonContract, votesTokenMasterCopyContract]
  );

  const setFractalFreezeGuard = useCallback(
    async (_guardContracts: FractalGuardContracts) => {
      const freezeGuard = await loadFractalFreezeGuard(_guardContracts);
      if (freezeGuard) {
        action.dispatch({ type: FractalGuardAction.SET_FREEZE_GUARD, payload: freezeGuard });
      }
    },
    [action, loadFractalFreezeGuard]
  );

  useEffect(() => {
    if (
      guardContracts.freezeVotingType !== null &&
      !!guardContracts.freezeVotingContract &&
      guardContracts.freezeVotingContract.asSigner.address !== loadKey.current &&
      loadOnMount
    ) {
      loadKey.current = guardContracts.freezeVotingContract.asSigner.address;
      setFractalFreezeGuard(guardContracts);
    }
  }, [setFractalFreezeGuard, guardContracts, daoAddress, loadOnMount]);

  useEffect(() => {
    const { freezeVotingContract, freezeVotingType: freezeVotingType } = guardContracts;
    if (!loadOnMount) return;
    let votingRPC: MultisigFreezeVoting | ERC20FreezeVoting;
    const listenerCallback: TypedListener<FreezeVoteCastEvent> = async (
      voter: string,
      votesCast
    ) => {
      const freezeProposalCreatedBlock = await votingRPC.freezeProposalCreatedBlock();
      action.dispatch({
        type: FractalGuardAction.UPDATE_FREEZE_VOTE,
        payload: {
          isVoter: voter === account,
          freezeProposalCreatedTime: BigNumber.from(
            await getTimeStamp(freezeProposalCreatedBlock, provider)
          ),
          votesCast,
        },
      });
    };

    if (isFreezeSet.current && freezeVotingType !== null && freezeVotingContract) {
      if (freezeVotingType === FreezeVotingType.MULTISIG) {
        votingRPC = getEventRPC<MultisigFreezeVoting>(
          freezeVotingContract as ContractConnection<MultisigFreezeVoting>,
          chainId
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        votingRPC = getEventRPC<ERC20FreezeVoting>(
          freezeVotingContract as ContractConnection<ERC20FreezeVoting>,
          chainId
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      }
    }
  }, [guardContracts, chainId, account, action, loadOnMount, provider]);
  return loadFractalFreezeGuard;
};
