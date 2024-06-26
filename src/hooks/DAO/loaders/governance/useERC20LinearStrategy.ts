import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { QuorumNumeratorUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/BaseQuorumPercent';
import { VotingPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { useCallback, useEffect } from 'react';
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

  const loadERC20Strategy = useCallback(async () => {
    if (!ozLinearVotingContractAddress || !azoriusContractAddress || !provider || !baseContracts) {
      return {};
    }
    const ozLinearVotingContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      ozLinearVotingContractAddress,
    );
    const azoriusContract =
      baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
    const [votingPeriodBlocks, quorumNumerator, quorumDenominator, timeLockPeriod] =
      await Promise.all([
        ozLinearVotingContract.votingPeriod(),
        (await ozLinearVotingContract.quorumNumerator()).toBigInt(),
        (await ozLinearVotingContract.QUORUM_DENOMINATOR()).toBigInt(),
        azoriusContract.timelockPeriod(),
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
    ozLinearVotingContractAddress,
    azoriusContractAddress,
    getTimeDuration,
    action,
    provider,
    baseContracts,
  ]);

  useEffect(() => {
    if (!ozLinearVotingContractAddress || !baseContracts) {
      return;
    }
    const ozLinearVotingContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      ozLinearVotingContractAddress,
    );

    const votingPeriodfilter = ozLinearVotingContract.filters.VotingPeriodUpdated();
    const listener: TypedListener<VotingPeriodUpdatedEvent> = votingPeriod => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
        payload: BigInt(votingPeriod),
      });
    };
    ozLinearVotingContract.on(votingPeriodfilter, listener);
    return () => {
      ozLinearVotingContract.off(votingPeriodfilter, listener);
    };
  }, [ozLinearVotingContractAddress, action, baseContracts]);

  useEffect(() => {
    if (!ozLinearVotingContractAddress || !baseContracts) {
      return;
    }
    const ozLinearVotingContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      ozLinearVotingContractAddress,
    );
    const quorumNumeratorUpdatedFilter = ozLinearVotingContract.filters.QuorumNumeratorUpdated();
    const quorumNumeratorUpdatedListener: TypedListener<
      QuorumNumeratorUpdatedEvent
    > = quorumPercentage => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_QUORUM,
        payload: quorumPercentage.toBigInt(),
      });
    };
    ozLinearVotingContract.on(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
    return () => {
      ozLinearVotingContract.off(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
    };
  }, [ozLinearVotingContractAddress, action, baseContracts]);

  return loadERC20Strategy;
};
