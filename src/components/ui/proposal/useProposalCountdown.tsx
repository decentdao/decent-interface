import { useCallback, useEffect, useRef, useState } from 'react';
import { getContract } from 'viem';
import { logError } from '../../../helpers/errorLogging';
import useSnapshotProposal from '../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useDAOProposals } from '../../../hooks/DAO/loaders/useProposals';
import useUpdateProposalState from '../../../hooks/DAO/proposal/useUpdateProposalState';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import useContractClient from '../../../hooks/utils/useContractClient';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  FractalProposal,
  FractalProposalState,
  AzoriusProposal,
  FreezeGuardType,
  MultisigFreezeGuard,
} from '../../../types';
import { blocksToSeconds } from '../../../utils/contract';
import { getTxTimelockedTimestamp } from '../../../utils/guard';

export function useProposalCountdown(proposal: FractalProposal) {
  const {
    governance,
    guardContracts: { freezeGuardContractAddress, freezeGuardType },
    governanceContracts,
    action,
    readOnly: { dao },
  } = useFractal();
  const baseContracts = useSafeContracts();
  const { publicClient } = useContractClient();

  const [secondsLeft, setSecondsLeft] = useState<number>();
  const { snapshotProposal, isSnapshotProposal } = useSnapshotProposal(proposal);

  const azoriusGovernance = governance as AzoriusGovernance;

  const loadDAOProposals = useDAOProposals();
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: action.dispatch,
  });

  let updateStateInterval = useRef<NodeJS.Timer | undefined>();
  let countdownInterval = useRef<NodeJS.Timer | undefined>();
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
            if (dao?.isAzorius) {
              await updateProposalState(BigInt(proposal.proposalId));
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
  }, [secondsLeft, loadDAOProposals, proposal, updateProposalState, governance.type, dao]);

  const startCountdown = useCallback((initialTimeMs: bigint) => {
    countdownInterval.current = setInterval(() => {
      setSecondsLeft(Math.floor((Number(initialTimeMs) - Date.now()) / 1000));
    }, 1000);
  }, []);

  const getCountdown = useCallback(async () => {
    if (!baseContracts || !publicClient) return;
    const freezeGuard =
      freezeGuardType === FreezeGuardType.MULTISIG && freezeGuardContractAddress
        ? getContract({
            client: publicClient,
            abi: baseContracts.multisigFreezeGuardMasterCopyContract.asPublic.abi,
            address: freezeGuardContractAddress,
          })
        : freezeGuardType === FreezeGuardType.AZORIUS && freezeGuardContractAddress
          ? getContract({
              address: freezeGuardContractAddress,
              client: publicClient,
              abi: baseContracts.azoriusFreezeGuardMasterCopyContract.asPublic.abi,
            })
          : undefined;

    const isSafeGuard = freezeGuardType === FreezeGuardType.MULTISIG;
    const isAzoriusGuard = freezeGuardType === FreezeGuardType.AZORIUS;

    const timeLockPeriod = azoriusGovernance.votingStrategy?.timeLockPeriod;
    const votingDeadlineMs = (proposal as AzoriusProposal).deadlineMs;

    // If the proposal is active and has a deadline, start the countdown (for Azorius proposals)
    if (proposal.state === FractalProposalState.ACTIVE && votingDeadlineMs) {
      startCountdown(BigInt(votingDeadlineMs));
      return;
    } else if (
      // If the proposal is timelocked and has a deadline, start the countdown (for Azorius proposals)
      proposal.state === FractalProposalState.TIMELOCKED &&
      votingDeadlineMs &&
      timeLockPeriod
    ) {
      startCountdown(BigInt(votingDeadlineMs) + timeLockPeriod.value * 1000n);
      // If the proposal is timelocked start the countdown (for safe multisig proposals with guards)
      return;
    } else if (
      proposal.state === FractalProposalState.TIMELOCKED &&
      freezeGuard &&
      isSafeGuard &&
      publicClient
    ) {
      const safeGuard = freezeGuard as unknown as MultisigFreezeGuard;
      const timelockedTimestamp = await getTxTimelockedTimestamp(proposal, safeGuard, publicClient);
      const guardTimeLockPeriod = await blocksToSeconds(
        Number(await safeGuard.read.timelockPeriod()),
        publicClient,
      );
      startCountdown(BigInt(timelockedTimestamp) * 1000n + BigInt(guardTimeLockPeriod) * 1000n);
      // If the proposal is executable start the countdown (for safe multisig proposals with guards)
      return;
    } else if (proposal.state === FractalProposalState.EXECUTABLE && freezeGuard) {
      let guardTimelockPeriod: bigint = 0n;
      if (isSafeGuard && publicClient) {
        const safeGuard = freezeGuard as unknown as MultisigFreezeGuard;
        const timelockedTimestamp =
          BigInt(await getTxTimelockedTimestamp(proposal, safeGuard, publicClient)) * 1000n;
        const safeGuardTimelockPeriod =
          BigInt(
            await blocksToSeconds(Number(await safeGuard.read.timelockPeriod()), publicClient),
          ) * 1000n;
        const guardExecutionPeriod =
          BigInt(
            await blocksToSeconds(Number(await safeGuard.read.executionPeriod()), publicClient),
          ) * 1000n;
        guardTimelockPeriod = timelockedTimestamp + safeGuardTimelockPeriod + guardExecutionPeriod;

        // If the proposal is executing start the countdown (for Azorius proposals with guards)
        return;
      } else if (isAzoriusGuard && timeLockPeriod && votingDeadlineMs) {
        guardTimelockPeriod = timeLockPeriod.value * 1000n + BigInt(votingDeadlineMs);
      }
      startCountdown(guardTimelockPeriod);
      return;
    } else if (isSnapshotProposal && proposal.state === FractalProposalState.PENDING) {
      startCountdown(BigInt(snapshotProposal.startTime) * 1000n);
      return;
    } else if (isSnapshotProposal) {
      startCountdown(BigInt(snapshotProposal.endTime) * 1000n);
      return;
    }
  }, [
    freezeGuardType,
    baseContracts,
    azoriusGovernance.votingStrategy,
    proposal,
    startCountdown,
    isSnapshotProposal,
    snapshotProposal,
    freezeGuardContractAddress,
    publicClient,
  ]);

  useEffect(() => {
    if (!baseContracts) return;

    // continually calculates the initial time (in ms) - the current time (in ms)
    // then converts it to seconds, all on a 1 second interval
    getCountdown();

    return () => {
      clearInterval(countdownInterval.current);
    };
  }, [baseContracts, getCountdown]);

  return secondsLeft;
}
