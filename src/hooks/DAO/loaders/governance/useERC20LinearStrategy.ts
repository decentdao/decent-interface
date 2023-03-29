import { OZLinearVoting } from '@fractal-framework/fractal-contracts';
import { QuorumNumeratorUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/@tokenwalk/seele/contracts/extensions/BaseQuorumPercent';
import {
  TimeLockUpdatedEvent,
  VotingPeriodUpdatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/@tokenwalk/seele/contracts/extensions/BaseTokenVoting';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { useCallback, useEffect } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useAzoriusStrategy = () => {
  const {
    governanceContracts: { ozLinearVotingContract },
    dispatch,
  } = useFractal();
  const {
    network: { chainId },
  } = useProvider();
  const { getTimeDuration } = useTimeHelpers();

  const loadAzoriusStrategy = useCallback(async () => {
    if (!ozLinearVotingContract) {
      return {};
    }
    const [votingPeriod, quorumPercentage, timeLockPeriod] = await Promise.all([
      ozLinearVotingContract.asSigner.votingPeriod(),
      ozLinearVotingContract.asSigner.quorumNumerator(),
      ozLinearVotingContract.asSigner.timeLockPeriod(),
    ]);
    const votingData = {
      votingPeriod: {
        value: votingPeriod,
        formatted: getTimeDuration(votingPeriod.toString()),
      },
      quorumPercentage: {
        value: quorumPercentage,
        formatted: getTimeDuration(quorumPercentage.toString()),
      },
      timeLockPeriod: {
        value: timeLockPeriod,
        formatted: getTimeDuration(timeLockPeriod.toString()),
      },
    };
    dispatch.governance({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [ozLinearVotingContract, getTimeDuration, dispatch]);

  useEffect(() => {
    if (!ozLinearVotingContract) {
      return;
    }
    const rpc = getEventRPC<OZLinearVoting>(ozLinearVotingContract, chainId);
    const votingPeriodfilter = rpc.filters.VotingPeriodUpdated();
    const listener: TypedListener<VotingPeriodUpdatedEvent> = votingPeriod => {
      dispatch.governance({
        type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
        payload: votingPeriod,
      });
    };

    const quorumNumeratorUpdatedFilter = rpc.filters.QuorumNumeratorUpdated();
    const quorumNumeratorUpdatedListener: TypedListener<
      QuorumNumeratorUpdatedEvent
    > = quorumPercentage => {
      dispatch.governance({
        type: FractalGovernanceAction.UPDATE_VOTING_QUORUM,
        payload: quorumPercentage,
      });
    };
    const timelockPeriodListener: TypedListener<TimeLockUpdatedEvent> = timelockPeriod => {
      dispatch.governance({
        type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD,
        payload: timelockPeriod,
      });
    };
    const timeLockPeriodFilter = rpc.filters.TimeLockUpdated();

    rpc.on(timeLockPeriodFilter, timelockPeriodListener);
    rpc.on(votingPeriodfilter, listener);
    rpc.on(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
    return () => {
      rpc.off(quorumNumeratorUpdatedFilter, quorumNumeratorUpdatedListener);
      rpc.off(timeLockPeriodFilter, timelockPeriodListener);
      rpc.off(votingPeriodfilter, listener);
    };
  }, [ozLinearVotingContract, chainId, dispatch]);

  return loadAzoriusStrategy;
};
