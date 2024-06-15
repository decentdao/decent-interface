import { useCallback, useEffect, useMemo } from 'react';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../../../assets/abi/Azorius';
import LinearERC721VotingAbi from '../../../../assets/abi/LinearERC721Voting';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC721LinearStrategy = () => {
  const {
    governanceContracts: { erc721LinearVotingContractAddress, azoriusContractAddress },
    action,
  } = useFractal();
  const provider = useEthersProvider();
  const { getTimeDuration } = useTimeHelpers();
  const publicClient = usePublicClient();

  const erc721LinearVotingContract = useMemo(() => {
    if (!erc721LinearVotingContractAddress || !publicClient) {
      return;
    }

    return getContract({
      abi: LinearERC721VotingAbi,
      address: getAddress(erc721LinearVotingContractAddress),
      client: publicClient,
    });
  }, [erc721LinearVotingContractAddress, publicClient]);

  const loadERC721Strategy = useCallback(async () => {
    if (!azoriusContractAddress || !provider || !erc721LinearVotingContract || !publicClient) {
      // TODO i don't like this
      return {};
    }

    const azoriusContract = getContract({
      abi: AzoriusAbi,
      address: getAddress(azoriusContractAddress),
      client: publicClient,
    });

    const [votingPeriodBlocks, quorumThreshold, timeLockPeriod] = await Promise.all([
      erc721LinearVotingContract.read.votingPeriod(),
      erc721LinearVotingContract.read.quorumThreshold(),
      azoriusContract.read.timelockPeriod(),
    ]);

    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, provider);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, provider);
    const votingData = {
      votingPeriod: {
        value: BigInt(votingPeriodValue),
        formatted: getTimeDuration(votingPeriodValue),
      },
      quorumThreshold: {
        value: quorumThreshold,
        formatted: quorumThreshold.toString(),
      },
      timeLockPeriod: {
        value: BigInt(timeLockPeriodValue),
        formatted: getTimeDuration(timeLockPeriodValue),
      },
      strategyType: VotingStrategyType.LINEAR_ERC721,
    };
    action.dispatch({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [
    action,
    azoriusContractAddress,
    erc721LinearVotingContract,
    getTimeDuration,
    provider,
    publicClient,
  ]);

  useEffect(() => {
    if (!erc721LinearVotingContract) {
      return;
    }

    const unwatch = erc721LinearVotingContract.watchEvent.VotingPeriodUpdated({
      onLogs: logs => {
        for (const log of logs) {
          if (!log.args.votingPeriod) {
            continue;
          }

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
            payload: BigInt(log.args.votingPeriod),
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, erc721LinearVotingContract]);

  useEffect(() => {
    if (!erc721LinearVotingContract) {
      return;
    }

    const unwatch = erc721LinearVotingContract.watchEvent.QuorumThresholdUpdated({
      onLogs: logs => {
        for (const log of logs) {
          if (!log.args.quorumThreshold) {
            continue;
          }

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_QUORUM_THRESHOLD,
            payload: log.args.quorumThreshold,
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [erc721LinearVotingContract, action]);

  return loadERC721Strategy;
};
