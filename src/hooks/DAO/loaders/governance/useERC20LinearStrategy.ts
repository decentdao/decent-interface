import { Azorius, LinearERC20Voting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { TimelockPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/MultisigFreezeGuard';
import { QuorumNumeratorUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/BaseQuorumPercent';
import { VotingPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { useEthersProvider } from '../../../utils/useEthersProvider';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC20LinearStrategy = () => {
  const {
    governanceContracts: { ozLinearVotingContract, azoriusContract },
    action,
  } = useFractal();
  const provider = useEthersProvider();
  const {
    network: { chainId },
  } = provider;
  const { getTimeDuration } = useTimeHelpers();

  const loadERC20Strategy = useCallback(async () => {
    if (!ozLinearVotingContract || !azoriusContract) {
      return {};
    }
    const [votingPeriodBlocks, quorumNumerator, quorumDenominator, timeLockPeriod] =
      await Promise.all([
        ozLinearVotingContract.asSigner.votingPeriod(),
        ozLinearVotingContract.asSigner.quorumNumerator(),
        ozLinearVotingContract.asSigner.QUORUM_DENOMINATOR(),
        azoriusContract.asSigner.timelockPeriod(),
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
  }, [ozLinearVotingContract, azoriusContract, getTimeDuration, action, provider]);

  useEffect(() => {
    if (!ozLinearVotingContract) {
      return;
    }
    const rpc = getEventRPC<LinearERC20Voting>(ozLinearVotingContract, chainId);
    const votingPeriodfilter = rpc.filters.VotingPeriodUpdated();
    const listener: TypedListener<VotingPeriodUpdatedEvent> = votingPeriod => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
        payload: BigNumber.from(votingPeriod),
      });
    };
    rpc.on(votingPeriodfilter, listener);
    return () => {
      rpc.off(votingPeriodfilter, listener);
    };
  }, [ozLinearVotingContract, chainId, action]);

  useEffect(() => {
    if (!ozLinearVotingContract) {
      return;
    }
    const rpc = getEventRPC<LinearERC20Voting>(ozLinearVotingContract, chainId);
    const quorumNumeratorUpdatedFilter = rpc.filters.QuorumNumeratorUpdated();
    const quorumNumeratorUpdatedListener: TypedListener<
      QuorumNumeratorUpdatedEvent
    > = quorumPercentage => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_QUORUM,
        payload: quorumPercentage,
      });
    };
    rpc.on(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
    return () => {
      rpc.off(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
    };
  }, [ozLinearVotingContract, chainId, action]);

  useEffect(() => {
    if (!azoriusContract) {
      return;
    }
    const rpc = getEventRPC<Azorius>(azoriusContract, chainId);
    const timeLockPeriodFilter = rpc.filters.TimelockPeriodUpdated();
    const timelockPeriodListener: TypedListener<TimelockPeriodUpdatedEvent> = timelockPeriod => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD,
        payload: BigNumber.from(timelockPeriod),
      });
    };
    rpc.on(timeLockPeriodFilter, timelockPeriodListener);
    return () => {
      rpc.off(timeLockPeriodFilter, timelockPeriodListener);
    };
  }, [azoriusContract, chainId, action]);

  return loadERC20Strategy;
};
