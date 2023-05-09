import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { Vote, Execute, Lock } from '@decent-org/fractal-ui';
import { AzoriusFreezeGuard, MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
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
  GovernanceModuleType,
  AzoriusProposal,
  FreezeGuardType,
} from '../../../types';
import { getTxTimelockedTimestamp } from '../../../utils/guard';

const ICONS_MAP = {
  vote: Vote,
  lock: Lock,
  execute: Execute,
};

function useCountdown(proposal: FractalProposal) {
  const [countdown, setCountdown] = useState<number>();
  const {
    governance,
    guardContracts: { freezeGuardContract, freezeGuardType },
    governanceContracts,
    action,
  } = useFractal();

  const {
    network: { chainId },
  } = useProvider();

  const azoriusProposal = proposal as AzoriusProposal;
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
        FractalProposalState.EXECUTABLE,
        FractalProposalState.EXECUTED,
        FractalProposalState.EXPIRED,
        FractalProposalState.REJECTED,
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
            if (governance.type === GovernanceModuleType.AZORIUS) {
              await updateProposalState(BigNumber.from(proposal.proposalId));
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

  const provider = useProvider();

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
      const freezeGuard =
        freezeGuardType === FreezeGuardType.MULTISIG
          ? (freezeGuardContract?.asSigner as MultisigFreezeGuard)
          : freezeGuardType === FreezeGuardType.AZORIUS
          ? (freezeGuardContract?.asSigner as AzoriusFreezeGuard)
          : undefined;

      const isSafeGuard = freezeGuardType === FreezeGuardType.MULTISIG;
      const isAzoriusGuard = freezeGuardType === FreezeGuardType.AZORIUS;

      const azoriusDeadline = azoriusProposal.deadline
        ? azoriusProposal.deadline * 1000
        : undefined;
      const timeLockPeriod = azoriusGovernance.votesStrategy?.timeLockPeriod;

      // If the proposal is active and has a deadline, start the countdown (for Azorius proposals)
      if (proposal.state === FractalProposalState.ACTIVE && azoriusDeadline) {
        startCountdown(azoriusDeadline, 1000);
      } else if (
        // If the proposal is time locked and has a deadline, start the countdown (for Azorius proposals)
        proposal.state === FractalProposalState.TIMELOCKED &&
        azoriusDeadline &&
        timeLockPeriod
      ) {
        startCountdown(azoriusDeadline + Number(timeLockPeriod.value) * 1000, 1000);
        // If the proposal is timelocked start the countdown (for safe multisig proposals with guards)
      } else if (proposal.state === FractalProposalState.TIMELOCKED && freezeGuard && isSafeGuard) {
        const safeGuard = freezeGuard as MultisigFreezeGuard;
        const timelockedTimestamp =
          (await getTxTimelockedTimestamp(proposal, safeGuard, provider)) * 1000;
        const guardTimeLockPeriod = Number(await safeGuard.timelockPeriod()) * 1000;
        startCountdown(timelockedTimestamp + guardTimeLockPeriod, 1000);
        // If the proposal is executing start the countdown (for safe multisig proposals with guards)
      } else if (proposal.state === FractalProposalState.EXECUTABLE && freezeGuard) {
        let guardTimelockPeriod: number = 0;
        if (isSafeGuard) {
          // @todo ~ test this timer.
          const safeGuard = freezeGuard as MultisigFreezeGuard;
          const timelockedTimestamp =
            (await getTxTimelockedTimestamp(proposal, safeGuard, provider)) * 1000;
          const safeGuardTimelockPeriod = Number(await safeGuard.timelockPeriod()) * 1000;
          const guardExecutionPeriod = Number(await safeGuard.executionPeriod()) * 1000;
          guardTimelockPeriod =
            timelockedTimestamp + safeGuardTimelockPeriod + guardExecutionPeriod;

          // If the proposal is executing start the countdown (for Azorius proposals with guards)
        } else if (isAzoriusGuard && timeLockPeriod && azoriusDeadline) {
          guardTimelockPeriod = Number(timeLockPeriod.value) * 1000 + azoriusDeadline;
        }
        startCountdown(guardTimelockPeriod, 1000);
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
    azoriusProposal.deadline,
    proposal.state,
    azoriusGovernance.votesStrategy,
    freezeGuardContract,
    freezeGuardType,
    proposal.state,
    azoriusGovernance.votesStrategy,
    freezeGuardContract,
    freezeGuardType,
  ]);

  return countdown;
}

function ProposalTime({ proposal }: { proposal: FractalProposal }) {
  const countdown = useCountdown(proposal);
  const { t } = useTranslation('proposal');

  const isActive = useMemo(() => proposal.state === FractalProposalState.ACTIVE, [proposal]);
  const isTimeLocked = useMemo(
    () => proposal.state === FractalProposalState.TIMELOCKED,
    [proposal]
  );
  const isExecutable = useMemo(
    () => proposal.state === FractalProposalState.EXECUTABLE,
    [proposal]
  );
  const showCountdown = useMemo(
    () => isActive || isTimeLocked || isExecutable,
    [isActive, isTimeLocked, isExecutable]
  );

  const tooltipLabel = t(
    isActive
      ? 'votingTooltip'
      : isTimeLocked
      ? 'timeLockedTooltip'
      : isExecutable
      ? 'executableTooltip'
      : ''
  );
  const iconName = isActive ? 'vote' : isTimeLocked ? 'lock' : isExecutable ? 'execute' : undefined;

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
