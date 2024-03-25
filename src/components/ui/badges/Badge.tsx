import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TOOLTIP_MAXW } from '../../../constants/common';
import { FractalProposalState, DAOState, FractalProposal } from '../../../types';
import { ProposalCountdown } from '../proposal/ProposalCountdown';

type BadgeType = {
  [key: string]: {
    tooltipKey?: string;
    bg: string;
    _hover: { bg: string; textColor: string };
    textColor: string;
  };
};

const greenText = '#8BDA8B';
const greenBG = '#0A320A';
const greenHoverText = '#78D378';
const greenHover = '#0E440E';

const redText = '#FFB2B2';
const redBG = '#640E0D';
const redHoverText = '#FF9999';
const redHover = '#4D0B0A';

const sandBG = '#C18D5A';
const sandHover = '#B97F46';
const sandText = '#2C1A08';
const sandHoverText = '#150D04  ';

const grayBG = '#9A979D';
const grayHover = '#8C8990';

const freezeBG = '#A3B9EC';
const freezeHover = '#8DA8E7';
const freezeText = '#0D2356';
const freezeHoverText = '#09193E';

const frozenBG = '#09193E';
const frozenText = '#D1DCF5';
const frozenHoverText = '#BCCCF0';
const frozenHover = '#17326E';

const BADGE_MAPPING: BadgeType = {
  [FractalProposalState.ACTIVE]: {
    tooltipKey: 'stateActiveTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover, textColor: greenHoverText },
  },
  [FractalProposalState.TIMELOCKED]: {
    tooltipKey: 'stateTimelockedTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover, textColor: greenHoverText },
  },
  [FractalProposalState.EXECUTED]: {
    tooltipKey: 'stateExecutedTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover, textColor: greenHoverText },
  },
  [FractalProposalState.EXECUTABLE]: {
    tooltipKey: 'stateExecutableTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover, textColor: greenHoverText },
  },
  [FractalProposalState.FAILED]: {
    tooltipKey: 'stateFailedTip',
    bg: redBG,
    textColor: redText,
    _hover: { bg: redHover, textColor: redHoverText },
  },
  [FractalProposalState.TIMELOCKABLE]: {
    tooltipKey: 'stateTimelockableTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover, textColor: greenHoverText },
  },
  [FractalProposalState.MODULE]: {
    tooltipKey: 'stateModuleTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover, textColor: greenHoverText },
  },
  [FractalProposalState.EXPIRED]: {
    tooltipKey: 'stateExpiredTip',
    bg: redBG,
    textColor: redText,
    _hover: { bg: redHover, textColor: redHoverText },
  },
  [FractalProposalState.REJECTED]: {
    tooltipKey: 'stateRejectedTip',
    bg: redBG,
    textColor: redText,
    _hover: { bg: redHover, textColor: redHoverText },
  },
  [FractalProposalState.PENDING]: {
    tooltipKey: 'statePendingTip',
    bg: sandBG,
    textColor: sandText,
    _hover: { bg: sandHover, textColor: sandHoverText },
  },
  [FractalProposalState.CLOSED]: {
    tooltipKey: 'stateClosedTip',
    bg: grayBG,
    textColor: '#000',
    _hover: { bg: grayHover, textColor: '#000' },
  },
  [DAOState.freezeInit]: {
    tooltipKey: 'stateFreezeInitTip',
    bg: freezeBG,
    textColor: freezeText,
    _hover: { bg: freezeHover, textColor: freezeHoverText },
  },
  [DAOState.frozen]: {
    tooltipKey: 'stateFrozenTip',
    bg: frozenBG,
    textColor: frozenText,
    _hover: { bg: frozenHover, textColor: frozenHoverText },
  },
  ownerApproved: {
    bg: 'sand.700',
    textColor: sandText,
    _hover: { bg: sandBG, textColor: sandHoverText },
  },
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
        <Text
          textStyle="text-md-sans-regular"
          lineHeight="1"
        >
          {t(labelKey)}
        </Text>
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
  );
}
