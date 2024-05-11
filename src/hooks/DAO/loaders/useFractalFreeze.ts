import {
  ERC20FreezeVoting,
  ERC721FreezeVoting,
  MultisigFreezeVoting,
} from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { FreezeVoteCastEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/ERC20FreezeVoting';
import { useCallback, useEffect, useRef } from 'react';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import {
  isWithinFreezeProposalPeriod,
  isWithinFreezePeriod,
} from '../../../helpers/freezePeriodHelpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGuardAction } from '../../../providers/App/guard/action';
import { useEthersProvider } from '../../../providers/Ethers/hooks/useEthersProvider';
import { FractalGuardContracts, FreezeVotingType } from '../../../types';
import { blocksToSeconds, getTimeStamp } from '../../../utils/contract';
import useSafeContracts from '../../safe/useSafeContracts';
import useUserERC721VotingTokens from '../proposal/useUserERC721VotingTokens';
import { FreezeGuard } from './../../../types/fractal';

export const useFractalFreeze = ({
  loadOnMount = true,
  parentSafeAddress,
}: {
  loadOnMount?: boolean;
  parentSafeAddress: string | null;
}) => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();
  const isFreezeSet = useRef(false);

  const { guardContracts, action } = useFractal();
  const baseContracts = useSafeContracts();
  const { address: account } = useAccount();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(
    parentSafeAddress,
    undefined,
    loadOnMount,
  );

  const provider = useEthersProvider();

  const loadFractalFreezeGuard = useCallback(
    async ({
      freezeVotingContractAddress,
      freezeVotingType: freezeVotingType,
    }: FractalGuardContracts) => {
      if (
        freezeVotingType == null ||
        !freezeVotingContractAddress ||
        !account ||
        !provider ||
        !baseContracts
      ) {
        return;
      }

      // @dev using freeze 'multisig' contract but these functions are the same for all freeze types
      const freezeVotingContract =
        baseContracts.freezeMultisigVotingMasterCopyContract.asProvider.attach(
          freezeVotingContractAddress,
        );
      let userHasVotes: boolean = false;
      const freezeCreatedBlock = await freezeVotingContract.freezeProposalCreatedBlock();

      const freezeVotesThreshold = (await freezeVotingContract.freezeVotesThreshold()).toBigInt();
      const freezeProposalCreatedBlock = await freezeVotingContract.freezeProposalCreatedBlock();
      const freezeProposalCreatedTime = await getTimeStamp(freezeProposalCreatedBlock, provider);
      const freezeProposalVoteCount = (
        await freezeVotingContract.freezeProposalVoteCount()
      ).toBigInt();
      const freezeProposalBlock = await freezeVotingContract.freezeProposalPeriod();
      // length of time to vote on freeze
      const freezeProposalPeriod = await blocksToSeconds(freezeProposalBlock, provider);
      const freezePeriodBlock = await freezeVotingContract.freezePeriod();
      // length of time frozen for in seconds
      const freezePeriod = await blocksToSeconds(freezePeriodBlock, provider);

      const userHasFreezeVoted = await freezeVotingContract.userHasFreezeVoted(
        account || zeroAddress,
        freezeCreatedBlock,
      );
      const isFrozen = await freezeVotingContract.isFrozen();

      const freezeGuard = {
        freezeVotesThreshold,
        freezeProposalCreatedTime: BigInt(freezeProposalCreatedTime),
        freezeProposalVoteCount,
        freezeProposalPeriod: BigInt(freezeProposalPeriod),
        freezePeriod: BigInt(freezePeriod),
        userHasFreezeVoted,
        isFrozen,
      };

      const {
        votesTokenMasterCopyContract,
        safeSingletonContract,
        freezeERC20VotingMasterCopyContract,
      } = baseContracts;

      if (freezeVotingType === FreezeVotingType.MULTISIG) {
        const safeContract = safeSingletonContract!.asProvider.attach(
          await (freezeVotingContract as MultisigFreezeVoting).parentGnosisSafe(),
        );
        const owners = await safeContract.getOwners();
        userHasVotes = owners.find(owner => owner === account) !== undefined;
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        const freezeERC20VotingContract = freezeERC20VotingMasterCopyContract.asProvider.attach(
          freezeVotingContractAddress,
        );
        const votesTokenContract = votesTokenMasterCopyContract!.asProvider.attach(
          await freezeERC20VotingContract.votesERC20(),
        );
        const currentTimestamp = await getTimeStamp('latest', provider);
        const isFreezeActive =
          isWithinFreezeProposalPeriod(
            freezeGuard.freezeProposalCreatedTime,
            freezeGuard.freezeProposalPeriod,
            BigInt(currentTimestamp),
          ) ||
          isWithinFreezePeriod(
            freezeGuard.freezeProposalCreatedTime,
            freezeGuard.freezePeriod,
            BigInt(currentTimestamp),
          );
        userHasVotes =
          (!isFreezeActive
            ? // freeze not active
              (await votesTokenContract.getVotes(account || '')).toBigInt()
            : // freeze is active
              (
                await votesTokenContract.getPastVotes(account || '', freezeCreatedBlock)
              ).toBigInt()) > 0n;
      } else if (freezeVotingType === FreezeVotingType.ERC721) {
        const { totalVotingTokenAddresses } = await getUserERC721VotingTokens(
          parentSafeAddress,
          undefined,
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
    [account, provider, baseContracts, getUserERC721VotingTokens, parentSafeAddress],
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
      !!guardContracts.freezeVotingContractAddress &&
      loadOnMount &&
      guardContracts.freezeVotingContractAddress + parentSafeAddress + account !== loadKey.current
    ) {
      setFractalFreezeGuard(guardContracts);
      loadKey.current = guardContracts.freezeVotingContractAddress + parentSafeAddress + account;
    }
    if (!parentSafeAddress) {
      loadKey.current = undefined;
    }
  }, [setFractalFreezeGuard, guardContracts, parentSafeAddress, loadOnMount, account]);

  useEffect(() => {
    const { freezeVotingContractAddress, freezeVotingType: freezeVotingType } = guardContracts;
    if (!loadOnMount || !provider || !baseContracts || !freezeVotingContractAddress) return;
    const {
      freezeERC721VotingMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      freezeERC20VotingMasterCopyContract,
    } = baseContracts;

    // @dev using freeze 'multisig' contract but these functions are the same for all freeze types
    let votingRPC: MultisigFreezeVoting | ERC20FreezeVoting | ERC721FreezeVoting =
      freezeMultisigVotingMasterCopyContract.asProvider.attach(freezeVotingContractAddress);

    const listenerCallback: TypedListener<FreezeVoteCastEvent> = async (
      voter: string,
      votesCast,
    ) => {
      const freezeProposalCreatedBlock = await votingRPC.freezeProposalCreatedBlock();
      action.dispatch({
        type: FractalGuardAction.UPDATE_FREEZE_VOTE,
        payload: {
          isVoter: voter === account,
          freezeProposalCreatedTime: BigInt(
            await getTimeStamp(freezeProposalCreatedBlock, provider),
          ),
          votesCast: votesCast.toBigInt(),
        },
      });
    };

    if (isFreezeSet.current && freezeVotingType !== null && freezeVotingContractAddress) {
      if (freezeVotingType === FreezeVotingType.MULTISIG) {
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        votingRPC = freezeERC20VotingMasterCopyContract.asProvider.attach(
          freezeVotingContractAddress,
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      } else if (freezeVotingType === FreezeVotingType.ERC721) {
        votingRPC = freezeERC721VotingMasterCopyContract.asProvider.attach(
          freezeVotingContractAddress,
        );
        const filter = votingRPC.filters.FreezeVoteCast();
        votingRPC.on(filter, listenerCallback);
      }
    }
  }, [guardContracts, account, action, loadOnMount, provider, baseContracts]);
  return loadFractalFreezeGuard;
};
