import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { Vote, Execute, Lock } from '@decent-org/fractal-ui';
import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTxQueuedTimestamp } from '../../../hooks/utils/useSafeActivitiesWithState';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { TxProposal, TxProposalState, UsulProposal, VetoGuardType } from '../../../types';

const ICONS_MAP = {
  vote: Vote,
  lock: Lock,
  execute: Execute,
};

function ProposalTime({ proposal }: { proposal: TxProposal }) {
  const [countdown, setCountdown] = useState<number>();
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timer>();
  const { t } = useTranslation('proposal');
  const {
    governance,
    gnosis: {
      guardContracts: { vetoGuardContract, vetoGuardType },
    },
  } = useFractal();

  const isActive = useMemo(() => proposal.state === TxProposalState.Active, [proposal]);
  const isTimeLocked = useMemo(() => proposal.state === TxProposalState.TimeLocked, [proposal]);
  const isQueued = useMemo(() => proposal.state === TxProposalState.Queued, [proposal]);
  const isExecutable = useMemo(() => proposal.state === TxProposalState.Executing, [proposal]);
  const showCountdown = useMemo(
    () => isActive || isTimeLocked || isExecutable || isQueued,
    [isActive, isTimeLocked, isExecutable, isQueued]
  );

  const usulProposal = proposal as UsulProposal;

  useEffect(() => {
    const timeLockPeriod = governance.governanceToken?.timeLockPeriod;
    if (!timeLockPeriod) {
      return;
    }

    async function getCountdown() {
      const vetoGuard =
        vetoGuardType === VetoGuardType.MULTISIG
          ? (vetoGuardContract?.asSigner as VetoGuard)
          : undefined;

      if (isActive && usulProposal.deadline) {
        const interval = setInterval(() => {
          setCountdown(usulProposal.deadline * 1000 - Date.now());
        }, 1000);
        setCountdownInterval(interval);
      } else if (isTimeLocked && usulProposal.deadline && timeLockPeriod) {
        const interval = setInterval(() => {
          setCountdown((usulProposal.deadline + Number(timeLockPeriod.value)) * 1000 - Date.now());
        }, 1000);
        setCountdownInterval(interval);
      } else if (isQueued && vetoGuard) {
        const queuedTimestamp = await getTxQueuedTimestamp(proposal, vetoGuard);
        const guardTimeLockPeriod = (await vetoGuard.timelockPeriod()).toNumber();
        const interval = setInterval(() => {
          setCountdown(queuedTimestamp + guardTimeLockPeriod - Date.now());
        }, 1000);
        setCountdownInterval(interval);
      } else if (isExecutable && vetoGuard) {
        const queuedTimestamp = await getTxQueuedTimestamp(proposal, vetoGuard);
        const guardTimeLockPeriod = (await vetoGuard.timelockPeriod()).toNumber();
        const guardExecutionPeriod = (await vetoGuard.executionPeriod()).toNumber();

        const interval = setInterval(() => {
          setCountdown(queuedTimestamp + guardTimeLockPeriod + guardExecutionPeriod - Date.now());
        }, 1000);
        setCountdownInterval(interval);
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
    isActive,
    isTimeLocked,
    isQueued,
    isExecutable,
    proposal.transaction,
    vetoGuardContract,
    vetoGuardType,
    proposal,
  ]);

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

  // Unfortunately, date-fns don't have anything handy for our countdown display format
  // So, have to do it manually
  const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
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
            {zeroPad(hoursLeft, 2)}:{zeroPad(minutesLeft, 2)}:{zeroPad(secondsLeft, 2)}
          </Text>
        </Flex>
      </Flex>
    </Tooltip>
  );
}

export default ProposalTime;
