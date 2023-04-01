import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { Vote, Execute, Lock } from '@decent-org/fractal-ui';
import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider } from 'wagmi';
import useUpdateProposalState from '../../../hooks/DAO/proposal/useUpdateProposalState';
import { getTxQueuedTimestamp } from '../../../hooks/utils/useSafeActivitiesWithState';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  FractalProposal,
  FractalProposalState,
  UsulProposal,
  VetoGuardType,
} from '../../../types';

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
    dispatch,
  } = useFractal();
  const {
    network: { chainId },
  } = useProvider();
  const usulProposal = proposal as UsulProposal;
  const azoriusGovernance = governance as AzoriusGovernance;
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: dispatch.governance,
    chainId,
  });

  let updateStateInterval = useRef<NodeJS.Timer | undefined>();
  useEffect(() => {
    if (proposal.state === FractalProposalState.Executing) {
      clearInterval(updateStateInterval.current);
      return;
    }
    if (countdown && countdown < 0 && !updateStateInterval.current) {
      updateStateInterval.current = setInterval(() => {
        // Wrap the updateProposalState call in an async IIFE
        (async () => {
          try {
            await updateProposalState(BigNumber.from(proposal.proposalNumber));
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
  }, [countdown, updateProposalState, proposal]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timer | undefined;
    const updateCountdown = (time: number) => {
      setCountdown(time);
    };

    const startCountdown = (initialTime: number, intervalTime: number) => {
      updateCountdown(initialTime);
      countdownInterval = setInterval(() => {
        updateCountdown(initialTime - Date.now());
      }, intervalTime);
    };

    async function getCountdown() {
      const timeLockPeriod = azoriusGovernance.votesStrategy?.timeLockPeriod;
      if (!timeLockPeriod) {
        return;
      }

      const vetoGuard =
        vetoGuardType === VetoGuardType.MULTISIG
          ? (vetoGuardContract?.asSigner as VetoGuard)
          : undefined;

      if (proposal.state === FractalProposalState.Active && usulProposal.deadline) {
        startCountdown(usulProposal.deadline * 1000, 1000);
      } else if (
        proposal.state === FractalProposalState.TimeLocked &&
        usulProposal.deadline &&
        timeLockPeriod
      ) {
        startCountdown((usulProposal.deadline + Number(timeLockPeriod.value)) * 1000, 1000);
      } else if (proposal.state === FractalProposalState.Queued && vetoGuard) {
        const queuedTimestamp = await getTxQueuedTimestamp(proposal, vetoGuard);
        const guardTimeLockPeriod = (await vetoGuard.timelockPeriod()).toNumber();
        startCountdown(queuedTimestamp + guardTimeLockPeriod, 1000);
      } else if (proposal.state === FractalProposalState.Executing && vetoGuard) {
        const queuedTimestamp = await getTxQueuedTimestamp(proposal, vetoGuard);
        const guardTimeLockPeriod = (await vetoGuard.timelockPeriod()).toNumber();
        const guardExecutionPeriod = (await vetoGuard.executionPeriod()).toNumber();
        startCountdown(queuedTimestamp + guardTimeLockPeriod + guardExecutionPeriod, 1000);
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
