import {
  ERC20FreezeVoting,
  ERC721FreezeVoting,
  MultisigFreezeVoting,
} from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { FreezeVoteCastEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/ERC20FreezeVoting';
import { BigNumber, constants } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import {
  isWithinFreezeProposalPeriod,
  isWithinFreezePeriod,
} from '../../../helpers/freezePeriodHelpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGuardAction } from '../../../providers/App/guard/action';
import { ContractConnection, FractalGuardContracts, FreezeVotingType } from '../../../types';
import { blocksToSeconds, getTimeStamp } from '../../../utils/contract';
import { useEthersProvider } from '../../utils/useEthersProvider';
import useUserERC721VotingTokens from '../proposal/useUserERC721VotingTokens';
import { FreezeGuard } from './../../../types/fractal';

export const useFractalFreeze = ({
  loadOnMount = true,
  parentSafeAddress,
}: {
  loadOnMount?: boolean;
  parentSafeAddress?: string | null;
}) => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();
  const isFreezeSet = useRef(false);

  const {
    node: { daoAddress },
    baseContracts: { votesTokenMasterCopyContract, safeSingletonContract },
    guardContracts,
    action,
  } = useFractal();
  const { address: account } = useAccount();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(
    undefined,
    parentSafeAddress,
    loadOnMount,
  );

  const provider = useEthersProvider();

  const loadFractalFreezeGuard = useCallback(
    async ({ freezeVotingContract, freezeVotingType: freezeVotingType }: FractalGuardContracts) => {
      if (freezeVotingType == null || !freezeVotingContract || !account) return;
      let userHasVotes: boolean = false;
      const freezeCreatedBlock = await (
        freezeVotingContract!.asProvider as
          | ERC20FreezeVoting
          | ERC721FreezeVoting
          | MultisigFreezeVoting
      ).freezeProposalCreatedBlock();

      const freezeVotesThreshold = await freezeVotingContract!.asProvider.freezeVotesThreshold();
      const freezeProposalCreatedBlock =
        await freezeVotingContract!.asProvider.freezeProposalCreatedBlock();
      const freezeProposalCreatedTime = await getTimeStamp(freezeProposalCreatedBlock, provider);
      const freezeProposalVoteCount =
        await freezeVotingContract!.asProvider.freezeProposalVoteCount();
      const freezeProposalBlock = await freezeVotingContract!.asProvider.freezeProposalPeriod();
      // length of time to vote on freeze
      const freezeProposalPeriod = await blocksToSeconds(freezeProposalBlock, provider);
      const freezePeriodBlock = await freezeVotingContract!.asProvider.freezePeriod();
      // length of time frozen for in seconds
      const freezePeriod = await blocksToSeconds(freezePeriodBlock, provider);

      const userHasFreezeVoted = await freezeVotingContract!.asProvider.userHasFreezeVoted(
        account || constants.AddressZero,
        freezeCreatedBlock,
      );
      const isFrozen = await freezeVotingContract!.asProvider.isFrozen();

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
        const safeContract = safeSingletonContract!.asProvider.attach(
          await (freezeVotingContract!.asProvider as MultisigFreezeVoting).parentGnosisSafe(),
        );
        const owners = await safeContract.getOwners();
        userHasVotes = owners.find(owner => owner === account) !== undefined;
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        const votesTokenContract = votesTokenMasterCopyContract!.asProvider.attach(
          await (freezeVotingContract!.asProvider as ERC20FreezeVoting).votesERC20(),
        );
        const currentTimestamp = await getTimeStamp('latest', provider);
        const isFreezeActive =
          isWithinFreezeProposalPeriod(
            BigNumber.from(freezeGuard.freezeProposalCreatedTime),
            BigNumber.from(freezeGuard.freezeProposalPeriod),
            BigNumber.from(currentTimestamp),
          ) ||
          isWithinFreezePeriod(
            BigNumber.from(freezeGuard.freezeProposalCreatedTime),
            BigNumber.from(freezeGuard.freezePeriod),
            BigNumber.from(currentTimestamp),
          );
        userHasVotes = (
          !isFreezeActive
            ? // freeze not active
              await votesTokenContract.getVotes(account || '')
            : // freeze is active
              await votesTokenContract.getPastVotes(account || '', freezeCreatedBlock)
        ).gt(0);
      } else if (freezeVotingType === FreezeVotingType.ERC721) {
        const { totalVotingTokenAddresses } = await getUserERC721VotingTokens(
          undefined,
          parentSafeAddress,
        );
        userHasVotes = totalVotingTokenAddresses.length > 0;
      }

      const freeze: FreezeGuard = {
        ...freezeGuard,
        userHasVotes,
      };
      isFreezeSet.current = true;
      return freeze;
    },
    [
      account,
      provider,
      safeSingletonContract,
      votesTokenMasterCopyContract,
      getUserERC721VotingTokens,
      parentSafeAddress,
    ],
  );

  const setFractalFreezeGuard = useCallback(
    async (_guardContracts: FractalGuardContracts) => {
      const freezeGuard = await loadFractalFreezeGuard(_guardContracts);
      if (freezeGuard) {
        action.dispatch({ type: FractalGuardAction.SET_FREEZE_GUARD, payload: freezeGuard });
      }
    },
    [action, loadFractalFreezeGuard],
  );

  useEffect(() => {
    if (
      guardContracts.freezeVotingType !== null &&
      !!guardContracts.freezeVotingContract &&
      loadOnMount &&
      guardContracts.freezeVotingContract.asProvider.address !== loadKey.current
    ) {
      loadKey.current = guardContracts.freezeVotingContract.asProvider.address;
      setFractalFreezeGuard(guardContracts);
    }
  }, [setFractalFreezeGuard, guardContracts, daoAddress, loadOnMount]);

  useEffect(() => {
    if (!loadOnMount) return;
    const { freezeVotingContract, freezeVotingType: freezeVotingType } = guardContracts;
    let votingRPC: MultisigFreezeVoting | ERC20FreezeVoting | ERC721FreezeVoting;
    const listenerCallback: TypedListener<FreezeVoteCastEvent> = async (
      voter: string,
      votesCast,
    ) => {
      const freezeProposalCreatedBlock = await votingRPC.freezeProposalCreatedBlock();
      action.dispatch({
        type: FractalGuardAction.UPDATE_FREEZE_VOTE,
        payload: {
          isVoter: voter === account,
          freezeProposalCreatedTime: BigNumber.from(
            await getTimeStamp(freezeProposalCreatedBlock, provider),
          ),
          votesCast,
        },
      });
    };

    if (isFreezeSet.current && freezeVotingType !== null && freezeVotingContract) {
      if (freezeVotingType === FreezeVotingType.MULTISIG) {
        votingRPC = getEventRPC<MultisigFreezeVoting>(
          freezeVotingContract as ContractConnection<MultisigFreezeVoting>,
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        votingRPC = getEventRPC<ERC20FreezeVoting>(
          freezeVotingContract as ContractConnection<ERC20FreezeVoting>,
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      } else if (freezeVotingType === FreezeVotingType.ERC721) {
        votingRPC = getEventRPC<ERC721FreezeVoting>(
          freezeVotingContract as ContractConnection<ERC721FreezeVoting>,
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      }
    }
  }, [guardContracts, account, action, loadOnMount, provider]);
  return loadFractalFreezeGuard;
};
