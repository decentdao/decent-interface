import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { TimelockPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/MultisigFreezeGuard';
import {
  VotingPeriodUpdatedEvent,
  QuorumThresholdUpdatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import useSafeContracts from '../../../safe/useSafeContracts';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC721LinearStrategy = () => {
  const {
    governanceContracts: { erc721LinearVotingContractAddress, azoriusContractAddress },
    governance: { type },
    action,
  } = useFractal();
  const provider = useEthersProvider();
  const { getTimeDuration } = useTimeHelpers();
  const baseContracts = useSafeContracts();
  const loadERC721Strategy = useCallback(async () => {
    if (
      !erc721LinearVotingContractAddress ||
      !azoriusContractAddress ||
      !provider ||
      !baseContracts
    ) {
      return {};
    }
    const erc721LinearVotingContract =
      baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
        erc721LinearVotingContractAddress,
      );
    const azoriusContract =
      baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);

    const [votingPeriodBlocks, quorumThreshold, timeLockPeriod] = await Promise.all([
      erc721LinearVotingContract.votingPeriod(),
      erc721LinearVotingContract.quorumThreshold(),
      azoriusContract.timelockPeriod(),
    ]);

    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, provider);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, provider);
    const votingData = {
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
    };
    action.dispatch({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [
    erc721LinearVotingContractAddress,
    azoriusContractAddress,
    getTimeDuration,
    action,
    provider,
    baseContracts,
  ]);

  useEffect(() => {
    if (!erc721LinearVotingContractAddress || !baseContracts || !type) {
      return;
    }
    const erc721LinearVotingContract =
      baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
        erc721LinearVotingContractAddress,
      );
    const votingPeriodfilter = erc721LinearVotingContract.filters.VotingPeriodUpdated();
    const listener: TypedListener<VotingPeriodUpdatedEvent> = votingPeriod => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
        payload: BigNumber.from(votingPeriod),
      });
    };
    erc721LinearVotingContract.on(votingPeriodfilter, listener);
    return () => {
      erc721LinearVotingContract.off(votingPeriodfilter, listener);
    };
  }, [erc721LinearVotingContractAddress, action, baseContracts, type]);

  useEffect(() => {
    if (!erc721LinearVotingContractAddress || !baseContracts || !type) {
      return;
    }
    const erc721LinearVotingContract =
      baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
        erc721LinearVotingContractAddress,
      );
    const quorumThresholdUpdatedFilter =
      erc721LinearVotingContract.filters.QuorumThresholdUpdated();
    const quorumThresholdUpdatedListener: TypedListener<
      QuorumThresholdUpdatedEvent
    > = quorumThreshold => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_VOTING_QUORUM_THRESHOLD,
        payload: quorumThreshold,
      });
    };
    erc721LinearVotingContract.on(quorumThresholdUpdatedFilter, quorumThresholdUpdatedListener);
    return () => {
      erc721LinearVotingContract.off(quorumThresholdUpdatedFilter, quorumThresholdUpdatedListener);
    };
  }, [erc721LinearVotingContractAddress, action, baseContracts, type]);

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

  return loadERC721Strategy;
};
