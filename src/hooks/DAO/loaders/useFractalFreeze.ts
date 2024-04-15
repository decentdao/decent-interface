import { useCallback, useEffect, useRef } from 'react';
import { Address, decodeEventLog, getContract, zeroAddress } from 'viem';
import { WatchContractEventOnLogsFn } from 'viem/_types/actions/public/watchContractEvent';
import { useAccount } from 'wagmi';
import {
  isWithinFreezeProposalPeriod,
  isWithinFreezePeriod,
} from '../../../helpers/freezePeriodHelpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGuardAction } from '../../../providers/App/guard/action';
import { FractalGuardContracts, FreezeGuard, FreezeVotingType } from '../../../types';
import { blocksToSeconds, getTimeStamp } from '../../../utils/contract';
import useSafeContracts from '../../safe/useSafeContracts';
import useContractClient from '../../utils/useContractClient';
import useUserERC721VotingTokens from '../proposal/useUserERC721VotingTokens';

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

  const { guardContracts, action } = useFractal();
  const baseContracts = useSafeContracts();
  const { address: account } = useAccount();
  const { walletOrPublicClient, publicClient } = useContractClient();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(
    undefined,
    parentSafeAddress,
    loadOnMount,
  );

  const loadFractalFreezeGuard = useCallback(
    async ({
      freezeVotingContractAddress,
      freezeVotingType: freezeVotingType,
    }: FractalGuardContracts) => {
      if (
        freezeVotingType == null ||
        !freezeVotingContractAddress ||
        !account ||
        !publicClient ||
        !baseContracts ||
        !walletOrPublicClient
      ) {
        return;
      }

      // @dev using freeze 'multisig' contract but these functions are the same for all freeze types
      const freezeVotingContract = getContract({
        address: freezeVotingContractAddress,
        abi: baseContracts.freezeMultisigVotingMasterCopyContract.asPublic.abi,
        client: publicClient,
      });
      let userHasVotes: boolean = false;
      const freezeCreatedBlock = await freezeVotingContract.read.freezeProposalCreatedBlock([]);

      const freezeVotesThreshold = await freezeVotingContract.read.freezeVotesThreshold([]);
      const freezeProposalCreatedBlock = await freezeVotingContract.read.freezeProposalCreatedBlock(
        [],
      );
      const freezeProposalCreatedTime = await getTimeStamp(
        freezeProposalCreatedBlock as bigint,
        publicClient,
      );
      const freezeProposalVoteCount = await freezeVotingContract.read.freezeProposalVoteCount([]);
      const freezeProposalBlock = await freezeVotingContract.read.freezeProposalPeriod([]);
      // length of time to vote on freeze
      const freezeProposalPeriod = await blocksToSeconds(Number(freezeProposalBlock), publicClient);
      const freezePeriodBlock = await freezeVotingContract.read.freezePeriod([]);
      // length of time frozen for in seconds
      const freezePeriod = await blocksToSeconds(Number(freezePeriodBlock), publicClient);

      const userHasFreezeVoted = await freezeVotingContract.read.userHasFreezeVoted([
        account || zeroAddress,
        freezeCreatedBlock,
      ]);
      const isFrozen = await freezeVotingContract.read.isFrozen([]);

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
        const safeContract = getContract({
          abi: safeSingletonContract.asPublic.abi,
          address: (await freezeVotingContract.read.parentGnosisSafe([])) as Address,
          client: walletOrPublicClient,
        });
        const owners = (await safeContract.read.getOwners([])) as Address[];
        userHasVotes = owners.find(owner => owner === account) !== undefined;
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        const freezeERC20VotingContract = getContract({
          address: freezeVotingContractAddress,
          abi: freezeERC20VotingMasterCopyContract.asPublic.abi,
          client: walletOrPublicClient,
        });
        const votesTokenContract = getContract({
          abi: votesTokenMasterCopyContract.asPublic.abi,
          address: (await freezeERC20VotingContract.read.votesERC20([])) as Address,
          client: walletOrPublicClient,
        });
        const currentTimestamp = await getTimeStamp('latest', publicClient);
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
              ((await votesTokenContract.read.getVotes([account || ''])) as bigint)
            : // freeze is active

              ((await votesTokenContract.read.getPastVotes([
                account || '',
                freezeCreatedBlock,
              ])) as bigint)) > 0n;
      } else if (freezeVotingType === FreezeVotingType.ERC721) {
        const { totalVotingTokenAddresses } = await getUserERC721VotingTokens(
          undefined,
          parentSafeAddress,
        );
        userHasVotes = totalVotingTokenAddresses.length > 0;
      }

      const freeze = {
        ...freezeGuard,
        userHasVotes,
      };
      isFreezeSet.current = true;
      return freeze;
    },
    [
      account,
      publicClient,
      baseContracts,
      getUserERC721VotingTokens,
      parentSafeAddress,
      walletOrPublicClient,
    ],
  );

  const setFractalFreezeGuard = useCallback(
    async (_guardContracts: FractalGuardContracts) => {
      const freezeGuard = await loadFractalFreezeGuard(_guardContracts);
      if (freezeGuard) {
        action.dispatch({
          type: FractalGuardAction.SET_FREEZE_GUARD,
          payload: freezeGuard as FreezeGuard,
        });
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
    if (!loadOnMount || !publicClient || !baseContracts || !freezeVotingContractAddress) return;
    const { freezeMultisigVotingMasterCopyContract } = baseContracts;

    // @dev using freeze 'multisig' contract but these functions are the same for all freeze types
    let votingRPC = getContract({
      address: freezeVotingContractAddress,
      abi: freezeMultisigVotingMasterCopyContract.asPublic.abi,
      client: publicClient,
    });

    const listenerCallback: WatchContractEventOnLogsFn<
      typeof freezeMultisigVotingMasterCopyContract.asPublic.abi,
      'FreezeVoteCast',
      undefined
    > = async logs => {
      logs.forEach(async log => {
        const decodedLog = decodeEventLog<
          typeof freezeMultisigVotingMasterCopyContract.asPublic.abi,
          'FreezeVoteCast'
        >({
          data: log.data as any,
          topics: log.topics,
          abi: freezeMultisigVotingMasterCopyContract.asPublic.abi,
        });
        const args = decodedLog.args as any[];
        const freezeProposalCreatedBlock = (await votingRPC.read.freezeProposalCreatedBlock(
          [],
        )) as bigint;
        action.dispatch({
          type: FractalGuardAction.UPDATE_FREEZE_VOTE,
          payload: {
            isVoter: (args[0] as Address) === account,
            freezeProposalCreatedTime: BigInt(
              await getTimeStamp(freezeProposalCreatedBlock, publicClient),
            ),
            votesCast: BigInt(args[1]!),
          },
        });
      });
    };

    if (isFreezeSet.current && freezeVotingType !== null && freezeVotingContractAddress) {
      votingRPC.watchEvent.FreezeVoteCast({}, { onLogs: listenerCallback as any });
    }
  }, [guardContracts, account, action, loadOnMount, publicClient, baseContracts]);
  return loadFractalFreezeGuard;
};
