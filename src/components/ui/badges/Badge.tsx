import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { ActiveTwo, Check, ClockTwo, CloseX, DoubleCheck } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { TxProposalState, DAOState } from '../../../types';

type BadgeType = { [key: string]: { Icon?: any; tooltipKey?: string; bg: string; color: string } };

const BADGE_MAPPING: BadgeType = {
  [TxProposalState.Active]: {
    Icon: ActiveTwo,
    tooltipKey: 'stateActiveTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Canceled]: {
    Icon: CloseX,
    tooltipKey: 'stateCanceledTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.TimeLocked]: {
    Icon: ClockTwo,
    tooltipKey: 'stateQueuedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Executed]: {
    Icon: DoubleCheck,
    tooltipKey: 'stateExecutedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Executing]: {
    Icon: Check,
    tooltipKey: 'stateExecutingTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Uninitialized]: {
    Icon: CloseX,
    tooltipKey: 'stateUninitializedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Failed]: {
    Icon: CloseX,
    tooltipKey: 'stateFailedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Queueable]: {
    Icon: ClockTwo,
    tooltipKey: 'stateQueueableTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Queued]: {
    Icon: ClockTwo,
    tooltipKey: 'stateQueuedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Module]: {
    tooltipKey: 'stateModuleTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Expired]: {
    Icon: ClockTwo,
    tooltipKey: 'stateExpiredTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [TxProposalState.Rejected]: {
    Icon: CloseX,
    tooltipKey: 'stateRejectedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [DAOState.freezeInit]: {
    Icon: Check,
    tooltipKey: 'stateFreezeInitTip',
    bg: 'blue.400',
    color: 'grayscale.black',
  },
  [DAOState.frozen]: {
    Icon: DoubleCheck,
    tooltipKey: 'stateFrozenTip',
    bg: 'blue.400',
    color: 'grayscale.black',
  },
  ownerApproved: { bg: 'sand.700', color: 'grayscale.black' },
};

type BadgeSize = { [key: string]: { minWidth: string; height: string } };
const BADGE_SIZES: BadgeSize = {
  sm: { minWidth: '5rem', height: '1.375rem' },
  base: { minWidth: '5.4375rem', height: '1.375rem' },
};

interface IBadge {
  size: 'sm' | 'base';
  labelKey: TxProposalState | DAOState | string;
}

export function Badge({ labelKey, size }: IBadge) {
  const { Icon, tooltipKey, ...colors } = BADGE_MAPPING[labelKey];
  const sizes = BADGE_SIZES[size];

  const { t } = useTranslation('proposal');
  return (
    <Tooltip
      label={tooltipKey ? t(tooltipKey) : undefined}
      maxW="18rem"
      placement="top"
    >
      <Flex
        padding="0.125rem 0.5rem"
        alignItems="center"
        gap="0.125rem"
        borderRadius="0.25rem"
        justifyContent="center"
        {...sizes}
        {...colors}
      >
        {!!Icon && <Icon />}
        <Text textStyle="text-sm-mono-semibold">{t(labelKey)}</Text>
      </Flex>
    </Tooltip>
  );
}
