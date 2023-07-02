import { AzoriusFreezeGuard, MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import { useProvider } from 'wagmi';
import { logError } from '../../../helpers/errorLogging';
import { useDAOProposals } from '../../../hooks/DAO/loaders/useProposals';
import useUpdateProposalState from '../../../hooks/DAO/proposal/useUpdateProposalState';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  FractalProposal,
  FractalProposalState,
  GovernanceModuleType,
  AzoriusProposal,
  FreezeGuardType,
} from '../../../types';
import { getAverageBlockTime } from '../../../utils/contract';
import { getTxTimelockedTimestamp } from '../../../utils/guard';

export function useProposalCountdown(proposal: FractalProposal) {
  const {
    governance,
    guardContracts: { freezeGuardContract, freezeGuardType },
    governanceContracts,
    action,
  } = useFractal();
  const provider = useProvider();
  const chainId = provider.network.chainId;

  const [secondsLeft, setSecondsLeft] = useState<number>();

  const azoriusGovernance = governance as AzoriusGovernance;

  const loadDAOProposals = useDAOProposals();
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: action.dispatch,
    chainId,
  });

  let updateStateInterval = useRef<NodeJS.Timer | undefined>();
  useEffect(() => {
    // if it's not a state that requires a countdown, clear the interval and return
    if (
      !(
        proposal.state === FractalProposalState.ACTIVE ||
        proposal.state === FractalProposalState.TIMELOCKED ||
        proposal.state === FractalProposalState.EXECUTABLE
      )
    ) {
      clearInterval(updateStateInterval.current);
      return;
    }

    // if the timer has run out, update proposals on a ten second interval
    // until we need another one
    if (secondsLeft && secondsLeft < 0 && !updateStateInterval.current) {
      updateStateInterval.current = setInterval(() => {
        // Wrap the updateProposalState call in an async IIFE
        (async () => {
          try {
            if (governance.type === GovernanceModuleType.AZORIUS) {
              await updateProposalState(BigNumber.from(proposal.proposalId));
            } else {
              await loadDAOProposals();
            }
          } catch (error) {
            logError('Error updating proposal state:', error);
          }
        })();
      }, 10000);
    } else if (secondsLeft && secondsLeft > 0) {
      // once we've found another countdown state, clear the
      // proposals update timer
      clearInterval(updateStateInterval.current);
      updateStateInterval.current = undefined;
    }

    return () => {
      if (!secondsLeft) {
        clearInterval(updateStateInterval.current);
      }
    };
  }, [secondsLeft, loadDAOProposals, proposal, updateProposalState, governance.type]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timer | undefined;

    // continually calculates the initial time (in ms) - the current time (in ms)
    // then converts it to seconds, all on a 1 second interval
    const startCountdown = (initialTimeMs: number) => {
      countdownInterval = setInterval(() => {
        setSecondsLeft(Math.floor((initialTimeMs - Date.now()) / 1000));
      }, 1000);
    };

    async function getCountdown() {
      const freezeGuard =
        freezeGuardType === FreezeGuardType.MULTISIG
          ? (freezeGuardContract?.asSigner as MultisigFreezeGuard)
          : freezeGuardType === FreezeGuardType.AZORIUS
          ? (freezeGuardContract?.asSigner as AzoriusFreezeGuard)
          : undefined;

      const isSafeGuard = freezeGuardType === FreezeGuardType.MULTISIG;
      const isAzoriusGuard = freezeGuardType === FreezeGuardType.AZORIUS;

      const timeLockPeriod = azoriusGovernance.votesStrategy?.timeLockPeriod;
      const votingDeadlineMs = (proposal as AzoriusProposal).deadlineMs;
      const averageBlockTime = await getAverageBlockTime(provider);

      // If the proposal is active and has a deadline, start the countdown (for Azorius proposals)
      if (proposal.state === FractalProposalState.ACTIVE && votingDeadlineMs) {
        startCountdown(votingDeadlineMs);
      } else if (
        // If the proposal is timelocked and has a deadline, start the countdown (for Azorius proposals)
        proposal.state === FractalProposalState.TIMELOCKED &&
        votingDeadlineMs &&
        timeLockPeriod
      ) {
        startCountdown(votingDeadlineMs + Number(timeLockPeriod.value) * 1000);
        // If the proposal is timelocked start the countdown (for safe multisig proposals with guards)
      } else if (proposal.state === FractalProposalState.TIMELOCKED && freezeGuard && isSafeGuard) {
        const safeGuard = freezeGuard as MultisigFreezeGuard;
        const timelockedTimestamp =
          (await getTxTimelockedTimestamp(proposal, safeGuard, provider)) * 1000;
        const guardTimeLockPeriod = (await safeGuard.timelockPeriod()) * averageBlockTime * 1000;
        startCountdown(timelockedTimestamp + guardTimeLockPeriod);
        // If the proposal is executable start the countdown (for safe multisig proposals with guards)
      } else if (proposal.state === FractalProposalState.EXECUTABLE && freezeGuard) {
        let guardTimelockPeriod: number = 0;
        if (isSafeGuard) {
          const safeGuard = freezeGuard as MultisigFreezeGuard;
          const timelockedTimestamp =
            (await getTxTimelockedTimestamp(proposal, safeGuard, provider)) * 1000;
          const safeGuardTimelockPeriod =
            Number(await safeGuard.timelockPeriod()) * averageBlockTime * 1000;
          const guardExecutionPeriod =
            Number(await safeGuard.executionPeriod()) * averageBlockTime * 1000;
          guardTimelockPeriod =
            timelockedTimestamp + safeGuardTimelockPeriod + guardExecutionPeriod;

          // If the proposal is executing start the countdown (for Azorius proposals with guards)
        } else if (isAzoriusGuard && timeLockPeriod && votingDeadlineMs) {
          guardTimelockPeriod = Number(timeLockPeriod.value) * 1000 + votingDeadlineMs;
        }
        startCountdown(guardTimelockPeriod);
      }
    }

    getCountdown();

    return () => {
      clearInterval(countdownInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal.state, azoriusGovernance.votesStrategy, freezeGuardContract, freezeGuardType]);

  return secondsLeft;
}
