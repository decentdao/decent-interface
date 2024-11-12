import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useMemo } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC721LinearStrategy = () => {
  const {
    governanceContracts: { linearVotingErc721Address, moduleAzoriusAddress },
    action,
  } = useFractal();
  const { getTimeDuration } = useTimeHelpers();
  const publicClient = usePublicClient();

  const erc721LinearVotingContract = useMemo(() => {
    if (!linearVotingErc721Address || !publicClient) {
      return;
    }

    return getContract({
      abi: abis.LinearERC721Voting,
      address: linearVotingErc721Address,
      client: publicClient,
    });
  }, [linearVotingErc721Address, publicClient]);

  const loadERC721Strategy = useCallback(async () => {
    if (!moduleAzoriusAddress || !erc721LinearVotingContract || !publicClient) {
      return;
    }

    const azoriusContract = getContract({
      abi: abis.Azorius,
      address: moduleAzoriusAddress,
      client: publicClient,
    });

    const [votingPeriodBlocks, quorumThreshold, proposerThreshold, timeLockPeriod] =
      await Promise.all([
        erc721LinearVotingContract.read.votingPeriod(),
        erc721LinearVotingContract.read.quorumThreshold(),
        erc721LinearVotingContract.read.proposerThreshold(),
        azoriusContract.read.timelockPeriod(),
      ]);

    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, publicClient);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, publicClient);
    const votingData = {
      proposerThreshold: {
        value: proposerThreshold,
        formatted: proposerThreshold.toString(),
      },
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
  }, [action, moduleAzoriusAddress, erc721LinearVotingContract, getTimeDuration, publicClient]);

  return loadERC721Strategy;
};
