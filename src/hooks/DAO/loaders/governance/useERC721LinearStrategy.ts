import { Azorius, LinearERC721Voting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { TimelockPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/MultisigFreezeGuard';
import {
  VotingPeriodUpdatedEvent,
  QuorumThresholdUpdatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { GovernanceSelectionType, VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC721LinearStrategy = () => {
  const {
    governanceContracts: { erc721LinearVotingContract, azoriusContract },
    action,
  } = useFractal();
  const provider = useProvider();
  const {
    network: { chainId },
  } = provider;
  const { getTimeDuration } = useTimeHelpers();

  const loadERC721Strategy = useCallback(async () => {
    if (!erc721LinearVotingContract || !azoriusContract) {
      return {};
    }
    const [votingPeriodBlocks, quorumThreshold, timeLockPeriod] = await Promise.all([
      erc721LinearVotingContract.asSigner.votingPeriod(),
      erc721LinearVotingContract.asSigner.quorumThreshold(),
      azoriusContract.asSigner.timelockPeriod(),
    ]);

    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, provider);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, provider);
    const votingData = {
      governanceType: GovernanceSelectionType.AZORIUS_ERC721,
      votingStrategy: {
        votingPeriod: {
          value: BigNumber.from(votingPeriodValue),
          formatted: getTimeDuration(votingPeriodValue),
        },
        quorumThreshold: {
          value: quorumThreshold,
          formatted: quorumThreshold.toString(),
        },
        timeLockPeriod: {
          value: BigNumber.from(timeLockPeriodValue),
          formatted: getTimeDuration(timeLockPeriodValue),
        },
        strategyType: VotingStrategyType.LINEAR_ERC721,
      },
    };
    action.dispatch({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [erc721LinearVotingContract, azoriusContract, getTimeDuration, action, provider]);

  useEffect(() => {
    if (!erc721LinearVotingContract) {
      return;
    }
    const rpc = getEventRPC<LinearERC721Voting>(erc721LinearVotingContract, chainId);
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
  }, [erc721LinearVotingContract, chainId, action]);

  useEffect(() => {
    if (!erc721LinearVotingContract) {
      return;
    }
    const rpc = getEventRPC<LinearERC721Voting>(erc721LinearVotingContract, chainId);
    const quorumThresholdUpdatedFilter = rpc.filters.QuorumThresholdUpdated();
    const quorumThresholdUpdatedListener: TypedListener<
      QuorumThresholdUpdatedEvent
    > = quorumThreshold => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_QUORUM_THRESHOLD,
        payload: quorumThreshold,
      });
    };
    rpc.on(quorumThresholdUpdatedFilter, quorumThresholdUpdatedListener);
    return () => {
      rpc.off(quorumThresholdUpdatedFilter, quorumThresholdUpdatedListener);
    };
  }, [erc721LinearVotingContract, chainId, action]);

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

  return loadERC721Strategy;
};
