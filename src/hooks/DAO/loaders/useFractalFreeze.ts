import { MultisigFreezeVoting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { FreezeVoteCastEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/BaseFreezeVoting';
import { useCallback, useEffect, useRef } from 'react';
import { getAddress, getContract, zeroAddress } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import ERC20FreezeVotingAbi from '../../../assets/abi/ERC20FreezeVoting';
import ERC721FreezeVotingAbi from '../../../assets/abi/ERC721FreezeVoting';
import GnosisSafeL2Abi from '../../../assets/abi/GnosisSafeL2';
import VotesERC20Abi from '../../../assets/abi/VotesERC20';
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
  const publicClient = usePublicClient();

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
        !baseContracts ||
        !publicClient
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

      if (freezeVotingType === FreezeVotingType.MULTISIG) {
        const safeContract = getContract({
          abi: GnosisSafeL2Abi,
          address: getAddress(
            await (freezeVotingContract as MultisigFreezeVoting).parentGnosisSafe(),
          ),
          client: publicClient,
        });
        const owners = await safeContract.read.getOwners();
        userHasVotes = owners.find(owner => owner === account) !== undefined;
      } else if (freezeVotingType === FreezeVotingType.ERC20) {
        const freezeERC20VotingContract = getContract({
          abi: ERC20FreezeVotingAbi,
          address: getAddress(freezeVotingContractAddress),
          client: publicClient,
        });
        const votesTokenContract = getContract({
          abi: VotesERC20Abi,
          address: await freezeERC20VotingContract.read.votesERC20(),
          client: publicClient,
        });
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
              await votesTokenContract.read.getVotes([account || ''])
            : // freeze is active
              await votesTokenContract.read.getPastVotes([
                account || '',
                BigInt(freezeCreatedBlock),
              ])) > 0n;
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
    [account, provider, baseContracts, publicClient, getUserERC721VotingTokens, parentSafeAddress],
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
    const { freezeMultisigVotingMasterCopyContract } = baseContracts;

    // @dev using freeze 'multisig' contract but these functions are the same for all freeze types
    const votingRPC: MultisigFreezeVoting =
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
      }
    }
  }, [guardContracts, account, action, loadOnMount, provider, baseContracts]);

  useEffect(() => {
    const { freezeVotingContractAddress, freezeVotingType: freezeVotingType } = guardContracts;

    if (
      !loadOnMount ||
      !provider ||
      !freezeVotingContractAddress ||
      !publicClient ||
      !isFreezeSet.current ||
      freezeVotingType !== FreezeVotingType.ERC721
    ) {
      return;
    }

    const freezeVotingContract = getContract({
      abi: ERC721FreezeVotingAbi,
      address: getAddress(freezeVotingContractAddress),
      client: publicClient,
    });

    const unwatch = freezeVotingContract.watchEvent.FreezeVoteCast(
      { voter: null },
      {
        onLogs: async logs => {
          for (const log of logs) {
            if (!log.args.voter || !log.args.votesCast) {
              continue;
            }

            const freezeProposalCreatedBlock =
              await freezeVotingContract.read.freezeProposalCreatedBlock();
            action.dispatch({
              type: FractalGuardAction.UPDATE_FREEZE_VOTE,
              payload: {
                isVoter: log.args.voter === account,
                freezeProposalCreatedTime: BigInt(
                  await getTimeStamp(freezeProposalCreatedBlock, provider),
                ),
                votesCast: log.args.votesCast,
              },
            });
          }
        },
      },
    );

    return () => {
      unwatch();
    };
  }, [account, action, guardContracts, loadOnMount, provider, publicClient]);

  useEffect(() => {
    const { freezeVotingContractAddress, freezeVotingType: freezeVotingType } = guardContracts;

    if (
      !loadOnMount ||
      !provider ||
      !freezeVotingContractAddress ||
      !publicClient ||
      !isFreezeSet.current ||
      freezeVotingType !== FreezeVotingType.ERC20
    ) {
      return;
    }

    const freezeVotingContract = getContract({
      abi: ERC20FreezeVotingAbi,
      address: getAddress(freezeVotingContractAddress),
      client: publicClient,
    });

    const unwatch = freezeVotingContract.watchEvent.FreezeVoteCast(
      { voter: null },
      {
        onLogs: async logs => {
          for (const log of logs) {
            if (!log.args.voter || !log.args.votesCast) {
              continue;
            }

            const freezeProposalCreatedBlock =
              await freezeVotingContract.read.freezeProposalCreatedBlock();
            action.dispatch({
              type: FractalGuardAction.UPDATE_FREEZE_VOTE,
              payload: {
                isVoter: log.args.voter === account,
                freezeProposalCreatedTime: BigInt(
                  await getTimeStamp(freezeProposalCreatedBlock, provider),
                ),
                votesCast: log.args.votesCast,
              },
            });
          }
        },
      },
    );

    return () => {
      unwatch();
    };
  }, [account, action, guardContracts, loadOnMount, provider, publicClient]);

  return loadFractalFreezeGuard;
};
