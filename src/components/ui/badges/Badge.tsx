import { Flex, Text } from '@chakra-ui/react';
import { ActiveTwo, Check, ClockTwo, CloseX, DoubleCheck } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { TxProposalState, DAOState } from '../../../providers/Fractal/types';

type BadgeType = { [key: string]: { Icon?: any; bg: string; color: string } };

const BADGE_MAPPING: BadgeType = {
  [TxProposalState.Pending]: { Icon: ClockTwo, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Active]: { Icon: ActiveTwo, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Executing]: { Icon: Check, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Executed]: { Icon: DoubleCheck, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Rejected]: { Icon: CloseX, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Approved]: { Icon: ActiveTwo, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Queued]: { Icon: ClockTwo, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Failed]: { Icon: CloseX, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Canceled]: { Icon: CloseX, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.TimeLocked]: { Icon: ClockTwo, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Uninitialized]: { Icon: CloseX, bg: 'sand.700', color: 'grayscale.black' },
  [TxProposalState.Module]: { bg: 'sand.700', color: 'grayscale.black' },
  [DAOState.freezeInit]: { Icon: Check, bg: 'blue.400', color: 'grayscale.black' },
  [DAOState.frozen]: { Icon: DoubleCheck, bg: 'blue.400', color: 'grayscale.black' },
};

type BadgeSize = { [key: string]: { minWidth: string; height: string } };
const BADGE_SIZES: BadgeSize = {
  sm: { minWidth: '5rem', height: '1.375rem' },
  base: { minWidth: '5.4375rem', height: '1.375rem' },
};

interface IBadge {
  size: 'sm' | 'base';
  labelKey: TxProposalState | DAOState;
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
      justifyContent="center"
      {...sizes}
      {...colors}
    >
      {!!Icon && <Icon />}
      <Text textStyle="text-sm-mono-semibold">{t(labelKey)}</Text>
    </Flex>
  );
}
