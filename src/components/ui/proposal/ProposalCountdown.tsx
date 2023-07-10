import { ComponentWithAs, Flex, IconProps, Text, Tooltip } from '@chakra-ui/react';
import { Vote, Execute, Lock } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FractalProposal, FractalProposalState } from '../../../types';
import { useProposalCountdown } from './useProposalCountdown';

/** pads a zero to the start of a number so that it is always 2 characters, e.g. '03' */
const zeroPad = (num: number) => String(num).padStart(2, '0');

/**
 * Displays a countdown timer for the provided proposal, based on its current state.
 *
 * ACTIVE state, for proposals that can currently be voted on (all Azorius)
 * TIMELOCKED state, for proposals that are waiting to be executed (all Azorius OR mulsig subDAOs)
 * EXECUTABLE state, for proposals that have a executionPeriod (all Azorius OR multisig subDAOs)
 *
 * For all other states this component will simply return null.
 */
export function ProposalCountdown({ proposal }: { proposal: FractalProposal }) {
  const secondsLeft = useProposalCountdown(proposal);
  const { t } = useTranslation('proposal');

  const state: FractalProposalState | null = useMemo(() => proposal.state, [proposal]);

  const showCountdown = useMemo(
    () =>
      !!secondsLeft &&
      secondsLeft > 0 &&
      (state === FractalProposalState.ACTIVE ||
        state === FractalProposalState.TIMELOCKED ||
        state === FractalProposalState.EXECUTABLE),
    [state, secondsLeft]
  );

  if (!showCountdown) return null;

  const tooltipLabel = t(
    state === FractalProposalState.ACTIVE
      ? 'votingTooltip'
      : state === FractalProposalState.TIMELOCKED
      ? 'timeLockedTooltip'
      : state === FractalProposalState.EXECUTABLE
      ? 'executableTooltip'
      : ''
  );

  const Icon: ComponentWithAs<'svg', IconProps> | null =
    state === FractalProposalState.ACTIVE
      ? Vote
      : state === FractalProposalState.TIMELOCKED
      ? Lock
      : state === FractalProposalState.EXECUTABLE
      ? Execute
      : null;

  const daysLeft = Math.floor(secondsLeft! / (60 * 60 * 24));
  const hoursLeft = Math.floor((secondsLeft! / (60 * 60)) % 24);
  const minutesLeft = Math.floor((secondsLeft! / 60) % 60);

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
            {daysLeft > 0 && `${zeroPad(daysLeft)}:`}
            {hoursLeft > 0 && `${zeroPad(hoursLeft)}:`}
            {minutesLeft > 0 && `${zeroPad(minutesLeft)}:`}
            {secondsLeft! >= 0 && `${zeroPad(secondsLeft! % 60)}`}
          </Text>
        </Flex>
      </Flex>
    </Tooltip>
  );
}
