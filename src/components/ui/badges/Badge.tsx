import { Flex, Text, Tooltip, Image } from '@chakra-ui/react';
import { ActiveTwo, Check, ClockTwo, CloseX, DoubleCheck } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { TOOLTIP_MAXW } from '../../../constants/common';
import { FractalProposalState, DAOState } from '../../../types';

type BadgeType = { [key: string]: { Icon?: any; tooltipKey?: string; bg: string; color: string } };

const BADGE_MAPPING: BadgeType = {
  [FractalProposalState.ACTIVE]: {
    Icon: ActiveTwo,
    tooltipKey: 'stateActiveTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.TIMELOCKED]: {
    Icon: ClockTwo,
    tooltipKey: 'stateTimelockedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.EXECUTED]: {
    Icon: DoubleCheck,
    tooltipKey: 'stateExecutedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.EXECUTABLE]: {
    Icon: Check,
    tooltipKey: 'stateExecutableTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.FAILED]: {
    Icon: CloseX,
    tooltipKey: 'stateFailedTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.TIMELOCKABLE]: {
    Icon: ClockTwo,
    tooltipKey: 'stateTimelockableTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.MODULE]: {
    tooltipKey: 'stateModuleTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.EXPIRED]: {
    Icon: ClockTwo,
    tooltipKey: 'stateExpiredTip',
    bg: 'sand.700',
    color: 'grayscale.black',
  },
  [FractalProposalState.REJECTED]: {
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
  labelKey: FractalProposalState | DAOState | string;
  isSnapshot: boolean;
}

export function Badge({ labelKey, size, isSnapshot }: IBadge) {
  const { Icon, tooltipKey, ...colors } = BADGE_MAPPING[labelKey];
  const sizes = BADGE_SIZES[size];

  const { t } = useTranslation('proposal');
  return (
    <>
      <Tooltip
        label={tooltipKey ? t(tooltipKey) : undefined}
        maxW={TOOLTIP_MAXW}
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
      {isSnapshot && (
        <Image
          src="/images/snapshot-icon.svg"
          alt="snapshot icon"
          ml={1}
        />
      )}
    </>
  );
}
