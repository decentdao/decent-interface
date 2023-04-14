import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { Vote, Execute, Lock } from '@decent-org/fractal-ui';
import { UsulVetoGuard, VetoGuard } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider } from 'wagmi';
import { useDAOProposals } from '../../../hooks/DAO/loaders/useProposals';
import useUpdateProposalState from '../../../hooks/DAO/proposal/useUpdateProposalState';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  FractalProposal,
  FractalProposalState,
  StrategyType,
  UsulProposal,
  VetoGuardType,
} from '../../../types';
import { getTxQueuedTimestamp } from '../../../utils/guard';

const ICONS_MAP = {
  vote: Vote,
  lock: Lock,
  execute: Execute,
};

function useCountdown(proposal: FractalProposal) {
  const [countdown, setCountdown] = useState<number>();
  const {
    governance,
    guardContracts: { vetoGuardContract, vetoGuardType },
    governanceContracts,
    action,
  } = useFractal();

  const {
    network: { chainId },
  } = useProvider();

  const usulProposal = proposal as UsulProposal;
  const azoriusGovernance = governance as AzoriusGovernance;
  const loadDAOProposals = useDAOProposals();
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: action.dispatch,
    chainId,
  });

  let updateStateInterval = useRef<NodeJS.Timer | undefined>();
  useEffect(() => {
    if (
      [
        FractalProposalState.Executing,
        FractalProposalState.Executed,
        FractalProposalState.Expired,
        FractalProposalState.Rejected,
        null,
      ].includes(proposal.state)
    ) {
      clearInterval(updateStateInterval.current);
      return;
    }
    if (countdown && countdown < 0 && !updateStateInterval.current) {
      updateStateInterval.current = setInterval(() => {
        // Wrap the updateProposalState call in an async IIFE
        (async () => {
          try {
            if (governance.type === StrategyType.GNOSIS_SAFE_USUL) {
              await updateProposalState(BigNumber.from(proposal.proposalNumber));
            } else {
              await loadDAOProposals();
            }
          } catch (error) {
            console.error('Error updating proposal state:', error);
          }
        })();
      }, 10000);
    } else if (countdown && countdown > 0 && updateStateInterval.current) {
      clearInterval(updateStateInterval.current);
      updateStateInterval.current = undefined;
    }
    return () => {
      if (updateStateInterval.current && !countdown) {
        clearInterval(updateStateInterval.current);
      }
    };
  }, [countdown, loadDAOProposals, proposal, updateProposalState, governance.type]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timer | undefined;
    const updateCountdown = (time: number) => {
      setCountdown(time);
    };

    const startCountdown = (initialTime: number, intervalTime: number) => {
      countdownInterval = setInterval(() => {
        updateCountdown(initialTime - Date.now());
      }, intervalTime);
    };

    async function getCountdown() {
      const vetoGuard =
        vetoGuardType === VetoGuardType.MULTISIG
          ? (vetoGuardContract?.asSigner as VetoGuard)
          : vetoGuardType === VetoGuardType.USUL
          ? (vetoGuardContract?.asSigner as UsulVetoGuard)
          : undefined;

      const isSafeGuard = vetoGuardType === VetoGuardType.MULTISIG;
      const isUsulGuard = vetoGuardType === VetoGuardType.USUL;

      const usulDeadline = usulProposal.deadline ? usulProposal.deadline * 1000 : undefined;
      const timeLockPeriod = azoriusGovernance.votesStrategy?.timeLockPeriod;

      // If the proposal is active and has a deadline, start the countdown (for usul proposals)
      if (proposal.state === FractalProposalState.Active && usulDeadline) {
        startCountdown(usulDeadline, 1000);
      } else if (
        // If the proposal is time locked and has a deadline, start the countdown (for usul proposals)
        proposal.state === FractalProposalState.TimeLocked &&
        usulDeadline &&
        timeLockPeriod
      ) {
        startCountdown(usulDeadline + Number(timeLockPeriod.value) * 1000, 1000);
        // If the proposal is queued start the countdown (for safe multisig proposals with guards)
      } else if (proposal.state === FractalProposalState.Queued && vetoGuard && isSafeGuard) {
        const safeGuard = vetoGuard as VetoGuard;
        const queuedTimestamp = (await getTxQueuedTimestamp(proposal, safeGuard)) * 1000;
        const guardTimeLockPeriod = Number(await safeGuard.timelockPeriod()) * 1000;
        startCountdown(queuedTimestamp + guardTimeLockPeriod, 1000);
        // If the proposal is executing start the countdown (for safe multisig proposals with guards)
      } else if (proposal.state === FractalProposalState.Executing && vetoGuard) {
        let guardTimelockPeriod: number = 0;
        if (isSafeGuard) {
          const safeGuard = vetoGuard as VetoGuard;
          const queuedTimestamp = (await getTxQueuedTimestamp(proposal, safeGuard)) * 1000;
          const safeGuardTimelockPeriod = Number(await safeGuard.timelockPeriod()) * 1000;
          guardTimelockPeriod = queuedTimestamp + safeGuardTimelockPeriod;
          // If the proposal is executing start the countdown (for Azorius proposals with guards)
        } else if (isUsulGuard && timeLockPeriod && usulDeadline) {
          guardTimelockPeriod = Number(timeLockPeriod.value) * 1000 + usulDeadline;
        }
        const guardExecutionPeriod = Number(await vetoGuard.executionPeriod()) * 1000;
        startCountdown(guardTimelockPeriod + guardExecutionPeriod, 1000);
      }
    }

    getCountdown();

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    usulProposal.deadline,
    proposal.state,
    azoriusGovernance.votesStrategy,
    vetoGuardContract,
    vetoGuardType,
    proposal.state,
    azoriusGovernance.votesStrategy,
    vetoGuardContract,
    vetoGuardType,
  ]);

  return countdown;
}

function ProposalTime({ proposal }: { proposal: FractalProposal }) {
  const countdown = useCountdown(proposal);
  const { t } = useTranslation('proposal');

  const isActive = useMemo(() => proposal.state === FractalProposalState.Active, [proposal]);
  const isTimeLocked = useMemo(
    () => proposal.state === FractalProposalState.TimeLocked,
    [proposal]
  );
  const isQueued = useMemo(() => proposal.state === FractalProposalState.Queued, [proposal]);
  const isExecutable = useMemo(() => proposal.state === FractalProposalState.Executing, [proposal]);
  const showCountdown = useMemo(
    () => isActive || isTimeLocked || isExecutable || isQueued,
    [isActive, isTimeLocked, isExecutable, isQueued]
  );

  const tooltipLabel = t(
    isActive
      ? 'votingTooltip'
      : isTimeLocked || isQueued
      ? 'timeLockedTooltip'
      : isExecutable
      ? 'executableTooltip'
      : ''
  );
  const iconName = isActive
    ? 'vote'
    : isTimeLocked || isQueued
    ? 'lock'
    : isExecutable
    ? 'execute'
    : undefined;

  let Icon = null;

  if (iconName) {
    Icon = ICONS_MAP[iconName];
  }

  if (!countdown || countdown < 0 || !showCountdown) {
    return null;
  }

  const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
  const daysLeft = Math.floor(countdown / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor(countdown / (1000 * 60 * 60));
  const minutesLeft = Math.floor((countdown / (60 * 1000)) % 60);
  const secondsLeft = Math.floor((countdown / 1000) % 60);

  return (
    <Tooltip
      label={tooltipLabel}
      placement="top"
    >
      <Flex
        justifyContent="flex-end"
        alignItems="center"
      >
        {Icon && <Icon />}
        <Flex
          px={2}
          gap={1}
        >
          <Text
            color="chocolate.200"
            textStyle="text-base-mono-semibold"
          >
            {daysLeft > 0 && `${zeroPad(daysLeft, 2)}:`}
            {hoursLeft > 0 && `${zeroPad(hoursLeft, 2)}:`}
            {minutesLeft > 0 && `${zeroPad(minutesLeft, 2)}:`}
            {secondsLeft > 0 && `${zeroPad(secondsLeft, 2)}`}
          </Text>
        </Flex>
      </Flex>
    </Tooltip>
  );
}

export default ProposalTime;
