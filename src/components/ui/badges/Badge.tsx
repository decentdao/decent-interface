import { Flex, Text } from '@chakra-ui/react';
import { ActiveTwo, Check, ClockTwo, CloseX, DoubleCheck, Tree } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';

type BadgeType = { [key: string]: { Icon: any; bg: string; color: string } };

export enum BadgeLabels {
  STATE_PENDING = 'statePending',
  STATE_ACTIVE = 'stateActive',
  STATE_EXECUTED = 'stateExecuted',
  STATE_EXECUTING = 'stateExecuting',
  STATE_REJECTED = 'stateRejected',
  STATE_TIME_LOCKED = 'stateTimeLocked',
  PARENT = 'parent',
  CHILD = 'child',
}

const BADGE_MAPPING: BadgeType = {
  [BadgeLabels.STATE_PENDING]: { Icon: ClockTwo, bg: 'sand.700', color: 'grayscale.black' },
  [BadgeLabels.STATE_ACTIVE]: { Icon: ActiveTwo, bg: 'sand.700', color: 'grayscale.black' },
  [BadgeLabels.STATE_EXECUTING]: { Icon: Check, bg: 'sand.700', color: 'grayscale.black' },
  [BadgeLabels.STATE_TIME_LOCKED]: { Icon: ClockTwo, bg: 'sand.700', color: 'grayscale.black' },
  [BadgeLabels.STATE_EXECUTED]: { Icon: DoubleCheck, bg: 'sand.700', color: 'grayscale.black' },
  [BadgeLabels.STATE_REJECTED]: { Icon: CloseX, bg: 'sand.700', color: 'grayscale.black' },
  [BadgeLabels.PARENT]: { Icon: Tree, bg: 'chocolate.500', color: 'grayscale.100' },
  [BadgeLabels.CHILD]: { Icon: Tree, bg: 'chocolate.500', color: 'gold.500' },
};

type BadgeSize = { [key: string]: { minWidth: string; height: string } };
const BADGE_SIZES: BadgeSize = {
  sm: { minWidth: '5rem', height: '1.375rem' },
  base: { minWidth: '5.4375rem', height: '1.375rem' },
};

interface IBadge {
  size: 'sm' | 'base';
  labelKey: string;
}

export function Badge({ labelKey, size }: IBadge) {
  const { Icon, ...colors } = BADGE_MAPPING[labelKey];
  const sizes = BADGE_SIZES[size];

  const { t } = useTranslation('proposal');
  return (
    <Flex
      padding="0.125rem 0.5rem"
      alignItems="center"
      gap="0.125rem"
      borderRadius="0.25rem"
      {...sizes}
      {...colors}
    >
      <Icon />
      <Text textStyle="text-sm-mono-semibold">{t(labelKey)}</Text>
    </Flex>
  );
}
