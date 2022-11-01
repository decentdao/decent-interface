import { Flex } from '@chakra-ui/react';
import { ActiveTwo, Check, ClockTwo, CloseX, DoubleCheck, Tree } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';

type BadgeType = { [key: string]: { Icon: any; bg: string; color: string } };

const BADGE_MAPPING: BadgeType = {
  pending: { Icon: ClockTwo, bg: 'sand.700', color: 'grayscale.black' },
  active: { Icon: ActiveTwo, bg: 'sand.700', color: 'grayscale.black' },
  passed: { Icon: Check, bg: 'sand.700', color: 'grayscale.black' },
  executed: { Icon: DoubleCheck, bg: 'sand.700', color: 'grayscale.black' },
  rejected: { Icon: CloseX, bg: 'sand.700', color: 'grayscale.black' },
  parent: { Icon: Tree, bg: 'chocolate.500', color: 'grayscale.100' },
  child: { Icon: Tree, bg: 'chocolate.500', color: 'gold.500' },
};

type BadgeSize = { [key: string]: { width: string; height: string } };
const BADGE_SIZES: BadgeSize = {
  sm: { width: '5rem', height: '1.375rem' },
  base: { width: '5.4375rem', height: '1.375rem' },
};

interface IBadge {
  size: 'sm' | 'base';
  labelKey: string;
}

export function Badge({ labelKey, size }: IBadge) {
  const { Icon, ...colors } = BADGE_MAPPING[labelKey];
  const sizes = BADGE_SIZES[size];

  const { t } = useTranslation('badge');
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
      {t(labelKey)}
    </Flex>
  );
}
