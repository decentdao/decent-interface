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

const greenText = '#56A355';
const greenBG = '#0A320A';
const greenHover = '#0E440E';

const redText = '#FFB2B2';
const redBG = '#640E0D';
const redHover = '#76110F';

const sandBG = '#C18D5A';
const sandHover = '#B97F46';
const blackText = '#150D04';

const grayBG = '#9A979D';
const grayHover = '#8C8990';

const lightBlueBG = '#A3B9EC';
const lightBlueHover = '#8DA8E7';
const darkBlueText = '#0A1E3D';

const darkBlueBG = '#1B3B83';
const darkBlueHover = '#17326E';
const lightBlueText = '#D1DCF5';

const BADGE_MAPPING: BadgeType = {
  [FractalProposalState.ACTIVE]: {
    tooltipKey: 'stateActiveTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.TIMELOCKED]: {
    tooltipKey: 'stateTimelockedTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.EXECUTED]: {
    tooltipKey: 'stateExecutedTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.EXECUTABLE]: {
    tooltipKey: 'stateExecutableTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.FAILED]: {
    tooltipKey: 'stateFailedTip',
    bg: redBG,
    textColor: redText,
    _hover: { bg: redHover },
  },
  [FractalProposalState.TIMELOCKABLE]: {
    tooltipKey: 'stateTimelockableTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.MODULE]: {
    tooltipKey: 'stateModuleTip',
    bg: greenBG,
    textColor: greenText,
    _hover: { bg: greenHover },
  },
  [FractalProposalState.EXPIRED]: {
    tooltipKey: 'stateExpiredTip',
    bg: redBG,
    textColor: redText,
    _hover: { bg: redHover },
  },
  [FractalProposalState.REJECTED]: {
    tooltipKey: 'stateRejectedTip',
    bg: redBG,
    textColor: redText,
    _hover: { bg: redHover },
  },
  [FractalProposalState.PENDING]: {
    tooltipKey: 'statePendingTip',
    bg: sandBG,
    textColor: blackText,
    _hover: { bg: sandHover },
  },
  [FractalProposalState.CLOSED]: {
    tooltipKey: 'stateClosedTip',
    bg: grayBG,
    textColor: '#000',
    _hover: { bg: grayHover },
  },
  [DAOState.freezeInit]: {
    tooltipKey: 'stateFreezeInitTip',
    bg: lightBlueBG,
    textColor: lightBlueText,
    _hover: { bg: darkBlueHover },
  },
  [DAOState.frozen]: {
    tooltipKey: 'stateFrozenTip',
    bg: darkBlueBG,
    textColor: darkBlueText,
    _hover: { bg: lightBlueHover },
  },
  ownerApproved: { bg: 'sand.700', textColor: 'grayscale.black', _hover: { bg: 'sand.600' } },
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
