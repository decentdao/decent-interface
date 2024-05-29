import { useCallback, useEffect, useMemo } from 'react';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../../../assets/abi/Azorius';
import LinearERC20VotingAbi from '../../../../assets/abi/LinearERC20Voting';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import useSafeContracts from '../../../safe/useSafeContracts';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC20LinearStrategy = () => {
  const {
    governanceContracts: { ozLinearVotingContractAddress, azoriusContractAddress },
    action,
  } = useFractal();
  const baseContracts = useSafeContracts();
  const provider = useEthersProvider();
  const { getTimeDuration } = useTimeHelpers();
  const publicClient = usePublicClient();

  const ozLinearVotingContract = useMemo(() => {
    if (!ozLinearVotingContractAddress || !publicClient) {
      return;
    }

    return getContract({
      abi: LinearERC20VotingAbi,
      address: getAddress(ozLinearVotingContractAddress),
      client: publicClient,
    });
  }, [ozLinearVotingContractAddress, publicClient]);

  const loadERC20Strategy = useCallback(async () => {
    if (
      !ozLinearVotingContract ||
      !azoriusContractAddress ||
      !provider ||
      !baseContracts ||
      !publicClient
    ) {
      return {};
    }

    const azoriusContract = getContract({
      abi: AzoriusAbi,
      address: getAddress(azoriusContractAddress),
      client: publicClient,
    });
    const [votingPeriodBlocks, quorumNumerator, quorumDenominator, timeLockPeriod] =
      await Promise.all([
        ozLinearVotingContract.read.votingPeriod(),
        ozLinearVotingContract.read.quorumNumerator(),
        ozLinearVotingContract.read.QUORUM_DENOMINATOR(),
        azoriusContract.read.timelockPeriod(),
      ]);

    const quorumPercentage = (quorumNumerator * 100n) / quorumDenominator;
    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, provider);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, provider);
    const votingData = {
      votingPeriod: {
        value: BigInt(votingPeriodValue),
        formatted: getTimeDuration(votingPeriodValue),
      },
      quorumPercentage: {
        value: quorumPercentage,
        formatted: quorumPercentage.toString() + '%',
      },
      timeLockPeriod: {
        value: BigInt(timeLockPeriodValue),
        formatted: getTimeDuration(timeLockPeriodValue),
      },
      strategyType: VotingStrategyType.LINEAR_ERC20,
    };
    action.dispatch({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [
    action,
    azoriusContractAddress,
    baseContracts,
    getTimeDuration,
    ozLinearVotingContract,
    provider,
    publicClient,
  ]);

  useEffect(() => {
    if (!ozLinearVotingContract || !publicClient) {
      return;
    }

    const unwatch = ozLinearVotingContract.watchEvent.VotingPeriodUpdated({
      onLogs: logs => {
        const lastLog = logs.pop();
        if (lastLog && lastLog.args.votingPeriod) {
          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
            payload: BigInt(lastLog.args.votingPeriod),
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, ozLinearVotingContract, publicClient]);

  useEffect(() => {
    if (!ozLinearVotingContract) {
      return;
    }

    const unwatch = ozLinearVotingContract.watchEvent.QuorumNumeratorUpdated({
      onLogs: logs => {
        const lastLog = logs.pop();
        if (lastLog && lastLog.args.quorumNumerator) {
          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_QUORUM,
            payload: lastLog.args.quorumNumerator,
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, ozLinearVotingContract]);

  return loadERC20Strategy;
};
