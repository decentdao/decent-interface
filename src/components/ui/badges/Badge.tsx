import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TOOLTIP_MAXW } from '../../../constants/common';
import { FractalProposalState, DAOState, FractalProposal } from '../../../types';
import { ProposalCountdown } from '../proposal/ProposalCountdown';

type BadgeType = {
  [key: string]: {
    tooltipKey?: string;
    bg: string;
    _hover: { bg: string };
    textColor: string;
  };
};

const greenPlus2 = '#56A355';
const greenMinus4 = '#0A320A';
const greenHover = '#0E440E';

const redPlus4 = '#FFC7C7';
const redMinus2 = '#640E0D';
const redHover = '#76110F';

const BADGE_MAPPING: BadgeType = {
  [FractalProposalState.ACTIVE]: {
    tooltipKey: 'stateActiveTip',
    bg: greenMinus4,
    textColor: greenPlus2,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.TIMELOCKED]: {
    tooltipKey: 'stateTimelockedTip',
    bg: 'sand.700',
    textColor: 'grayscale.black',
    _hover: { bg: 'sand.600' },
  },
  [FractalProposalState.EXECUTED]: {
    tooltipKey: 'stateExecutedTip',
    bg: greenMinus4,
    textColor: greenPlus2,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.EXECUTABLE]: {
    tooltipKey: 'stateExecutableTip',
    bg: greenMinus4,
    textColor: greenPlus2,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.FAILED]: {
    tooltipKey: 'stateFailedTip',
    bg: redMinus2,
    textColor: redPlus4,
    _hover: { bg: redHover },
  },
  [FractalProposalState.TIMELOCKABLE]: {
    tooltipKey: 'stateTimelockableTip',
    bg: greenMinus4,
    textColor: greenPlus2,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.MODULE]: {
    tooltipKey: 'stateModuleTip',
    bg: 'sand.700',
    textColor: 'grayscale.black',
    _hover: { bg: 'sand.600' },
  },
  [FractalProposalState.EXPIRED]: {
    tooltipKey: 'stateExpiredTip',
    bg: redMinus2,
    textColor: redPlus4,
    _hover: { bg: redHover },
  },
  [FractalProposalState.REJECTED]: {
    tooltipKey: 'stateRejectedTip',
    bg: redMinus2,
    textColor: redPlus4,
    _hover: { bg: redHover },
  },
  [FractalProposalState.PENDING]: {
    tooltipKey: 'statePendingTip',
    bg: greenMinus4,
    textColor: greenPlus2,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.CLOSED]: {
    tooltipKey: 'stateClosedTip',
    bg: greenMinus4,
    textColor: greenPlus2,
    _hover: { bg: greenHover },
  },
  [DAOState.freezeInit]: {
    tooltipKey: 'stateFreezeInitTip',
    bg: 'blue.400',
    textColor: 'grayscale.black',
    _hover: { bg: 'blue.400-hover' },
  },
  [DAOState.frozen]: {
    tooltipKey: 'stateFrozenTip',
    bg: 'blue.400',
    textColor: 'grayscale.black',
    _hover: { bg: 'blue.400-hover' },
  },
  ownerApproved: { bg: 'sand.700', textColor: 'grayscale.black', _hover: { bg: 'sand.600' }, },
};

type BadgeSize = { [key: string]: { minWidth: string; height: string } };
const BADGE_SIZES: BadgeSize = {
  sm: { minWidth: '5rem', height: '1.375rem' },
  base: { minWidth: '5.4375rem', height: '1.375rem' },
};

interface IBadge {
  size: 'sm' | 'base';
  labelKey: FractalProposalState | DAOState | string;
  // add as undefined to avoid breaking changes
  proposal?: FractalProposal;
}

export function Badge({ labelKey, size, proposal }: IBadge) {
  const { tooltipKey, ...colors } = BADGE_MAPPING[labelKey];
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
          alignItems="center"
          gap="0.5rem"
          borderRadius="0.25rem"
          justifyContent="center"
          h="1.5rem"
          w="fit-content"
          p="0.5rem"
          lineHeight={1.5}
          {...sizes}
          {...colors}
        >
          <Box
            rounded="full"
            bg={colors.textColor}
            w="0.5rem"
            h="0.5rem"
          />
          <Text textStyle="text-md-sans-regular">{t(labelKey)}</Text>
          {proposal && (
            <ProposalCountdown
              proposal={proposal}
              showIcon={false}
              textColor={colors.textColor}
              textStyle="text-md-sans-regular"
            />
          )}
        </Flex>
      </Tooltip>
    </>
  );
}
