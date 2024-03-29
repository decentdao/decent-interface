import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { TimelockPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/MultisigFreezeGuard';
import { QuorumNumeratorUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/BaseQuorumPercent';
import { VotingPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { BigNumber } from 'ethers';
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
    governance: { type },
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
        ozLinearVotingContract.quorumNumerator(),
        ozLinearVotingContract.QUORUM_DENOMINATOR(),
        azoriusContract.timelockPeriod(),
      ]);

    const quorumPercentage = quorumNumerator.mul(100).div(quorumDenominator);
    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, provider);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, provider);
    const votingData = {
      votingPeriod: {
        value: BigNumber.from(votingPeriodValue),
        formatted: getTimeDuration(votingPeriodValue),
      },
      quorumPercentage: {
        value: quorumPercentage,
        formatted: quorumPercentage.toString() + '%',
      },
      timeLockPeriod: {
        value: BigNumber.from(timeLockPeriodValue),
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
    if (!ozLinearVotingContractAddress || !baseContracts || !type) {
      return;
    }
    const ozLinearVotingContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      ozLinearVotingContractAddress,
    );

    const votingPeriodfilter = ozLinearVotingContract.filters.VotingPeriodUpdated();
    const listener: TypedListener<VotingPeriodUpdatedEvent> = votingPeriod => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
        payload: BigNumber.from(votingPeriod),
      });
    };
    ozLinearVotingContract.on(votingPeriodfilter, listener);
    return () => {
      ozLinearVotingContract.off(votingPeriodfilter, listener);
    };
  }, [ozLinearVotingContractAddress, action, baseContracts, type]);

  useEffect(() => {
    if (!ozLinearVotingContractAddress || !baseContracts || !type) {
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
        payload: quorumPercentage,
      });
    };
    ozLinearVotingContract.on(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
    return () => {
      ozLinearVotingContract.off(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
    };
  }, [ozLinearVotingContractAddress, action, baseContracts, type]);

  useEffect(() => {
    if (!azoriusContractAddress || !baseContracts || !type) {
      return;
    }
    const azoriusContract =
      baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
    const timeLockPeriodFilter = azoriusContract.filters.TimelockPeriodUpdated();
    const timelockPeriodListener: TypedListener<TimelockPeriodUpdatedEvent> = timelockPeriod => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD,
        payload: BigNumber.from(timelockPeriod),
      });
    };
    azoriusContract.on(timeLockPeriodFilter, timelockPeriodListener);
    return () => {
      azoriusContract.off(timeLockPeriodFilter, timelockPeriodListener);
    };
  }, [azoriusContractAddress, action, baseContracts, type]);

  return loadERC20Strategy;
};
