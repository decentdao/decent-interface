import { useCallback } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import useSafeContracts from '../../../safe/useSafeContracts';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC721LinearStrategy = () => {
  const {
    governanceContracts: { erc721LinearVotingContractAddress, azoriusContractAddress },
    action,
  } = useFractal();
  const { getTimeDuration } = useTimeHelpers();
  const baseContracts = useSafeContracts();
  const publicClient = usePublicClient();
  const loadERC721Strategy = useCallback(async () => {
    if (
      !erc721LinearVotingContractAddress ||
      !azoriusContractAddress ||
      !publicClient ||
      !baseContracts
    ) {
      return {};
    }
    const erc721LinearVotingContract = getContract({
      client: publicClient,
      address: erc721LinearVotingContractAddress,
      abi: baseContracts.linearVotingERC721MasterCopyContract?.asPublic.abi!,
    });
    const azoriusContract = getContract({
      address: azoriusContractAddress,
      abi: baseContracts.fractalAzoriusMasterCopyContract.asPublic.abi,
      client: publicClient,
    });

    const [votingPeriodBlocks, quorumThreshold, timeLockPeriod] = await Promise.all([
      erc721LinearVotingContract.read.votingPeriod([]),
      erc721LinearVotingContract.read.quorumThreshold([]),
      azoriusContract.read.timelockPeriod([]),
    ]);

    const votingPeriodValue = await blocksToSeconds(Number(votingPeriodBlocks), publicClient);
    const timeLockPeriodValue = await blocksToSeconds(Number(timeLockPeriod), publicClient);
    const votingData = {
      votingPeriod: {
        value: BigInt(votingPeriodValue),
        formatted: getTimeDuration(votingPeriodValue),
      },
      quorumThreshold: {
        value: BigInt(quorumThreshold as bigint),
        formatted: BigInt(quorumThreshold as bigint).toString(),
      },
      timeLockPeriod: {
        value: BigInt(timeLockPeriodValue),
        formatted: getTimeDuration(timeLockPeriodValue),
      },
      strategyType: VotingStrategyType.LINEAR_ERC721,
    };
    action.dispatch({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [
    erc721LinearVotingContractAddress,
    azoriusContractAddress,
    getTimeDuration,
    action,
    publicClient,
    baseContracts,
  ]);

  return loadERC721Strategy;
};
