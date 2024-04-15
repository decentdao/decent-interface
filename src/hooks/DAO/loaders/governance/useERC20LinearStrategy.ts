import { useCallback } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
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
  const publicClient = usePublicClient();
  const { getTimeDuration } = useTimeHelpers();

  const loadERC20Strategy = useCallback(async () => {
    if (
      !ozLinearVotingContractAddress ||
      !azoriusContractAddress ||
      !publicClient ||
      !baseContracts
    ) {
      return {};
    }
    const ozLinearVotingContract = getContract({
      address: ozLinearVotingContractAddress,
      client: publicClient,
      abi: baseContracts.linearVotingMasterCopyContract.asPublic.abi,
    });
    const azoriusContract = getContract({
      abi: baseContracts.fractalAzoriusMasterCopyContract.asPublic.abi,
      address: azoriusContractAddress,
      client: publicClient,
    });
    const [votingPeriodBlocks, quorumNumerator, quorumDenominator, timeLockPeriod] =
      await Promise.all([
        (await ozLinearVotingContract.read.votingPeriod([])) as bigint,
        (await ozLinearVotingContract.read.quorumNumerator([])) as bigint,
        (await ozLinearVotingContract.read.QUORUM_DENOMINATOR([])) as bigint,
        (await azoriusContract.read.timelockPeriod([])) as bigint,
      ]);

    const quorumPercentage = (quorumNumerator * 100n) / quorumDenominator;
    const votingPeriodValue = await blocksToSeconds(Number(votingPeriodBlocks), publicClient);
    const timeLockPeriodValue = await blocksToSeconds(Number(timeLockPeriod), publicClient);
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
    ozLinearVotingContractAddress,
    azoriusContractAddress,
    getTimeDuration,
    action,
    publicClient,
    baseContracts,
  ]);

  return loadERC20Strategy;
};
