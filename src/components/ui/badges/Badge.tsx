import { Flex, Text } from '@chakra-ui/react';
import { ActiveTwo, Check, ClockTwo, CloseX, DoubleCheck, Tree } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';

type BadgeType = { [key: string]: { Icon: any; bg: string; color: string } };

const BADGE_MAPPING: BadgeType = {
  statePending: { Icon: ClockTwo, bg: 'sand.700', color: 'grayscale.black' },
  stateActive: { Icon: ActiveTwo, bg: 'sand.700', color: 'grayscale.black' },
  statePassed: { Icon: Check, bg: 'sand.700', color: 'grayscale.black' },
  stateExecuted: { Icon: DoubleCheck, bg: 'sand.700', color: 'grayscale.black' },
  stateRejected: { Icon: CloseX, bg: 'sand.700', color: 'grayscale.black' },
  parent: { Icon: Tree, bg: 'chocolate.500', color: 'grayscale.100' },
  child: { Icon: Tree, bg: 'chocolate.500', color: 'gold.500' },
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
