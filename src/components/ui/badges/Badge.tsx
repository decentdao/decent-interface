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

const BADGE_MAPPING: BadgeType = {
  [FractalProposalState.ACTIVE]: {
    tooltipKey: 'stateActiveTip',
    bg: 'lilac-0',
    textColor: 'cosmic-nebula-0',
    _hover: { bg: 'lilac--1', textColor: 'cosmic-nebula-0' },
  },
  [FractalProposalState.TIMELOCKED]: {
    tooltipKey: 'stateTimelockedTip',
    bg: 'neutral-8',
    textColor: 'neutral-4',
    _hover: { bg: 'neutral-7', textColor: 'neutral-4' },
  },
  [FractalProposalState.EXECUTED]: {
    tooltipKey: 'stateExecutedTip',
    bg: 'celery--5',
    textColor: 'white-0',
    _hover: { bg: 'celery--6', textColor: 'white-0' },
  },
  [FractalProposalState.EXECUTABLE]: {
    tooltipKey: 'stateExecutableTip',
    bg: 'celery--2',
    textColor: 'black-0',
    _hover: { bg: 'celery--3', textColor: 'black-0' },
  },
  [FractalProposalState.FAILED]: {
    tooltipKey: 'stateFailedTip',
    bg: 'red-0',
    textColor: 'red-4',
    _hover: { bg: 'red--1', textColor: 'red-4' },
  },
  [FractalProposalState.TIMELOCKABLE]: {
    tooltipKey: 'stateTimelockableTip',
    bg: 'lilac-0',
    textColor: 'cosmic-nebula-0',
    _hover: { bg: 'lilac--1', textColor: 'cosmic-nebula-0' },
  },
  [FractalProposalState.MODULE]: {
    tooltipKey: 'stateModuleTip',
    bg: 'lilac-0',
    textColor: 'cosmic-nebula-0',
    _hover: { bg: 'lilac--1', textColor: 'cosmic-nebula-0' },
  },
  [FractalProposalState.EXPIRED]: {
    tooltipKey: 'stateExpiredTip',
    bg: 'neutral-4',
    textColor: 'neutral-7',
    _hover: { bg: 'neutral-2', textColor: 'neutral-7' },
  },
  [FractalProposalState.REJECTED]: {
    tooltipKey: 'stateRejectedTip',
    bg: 'red-0',
    textColor: 'red-4',
    _hover: { bg: 'red--1', textColor: 'red-4' },
  },
  [FractalProposalState.PENDING]: {
    tooltipKey: 'statePendingTip',
    bg: 'yellow-0',
    textColor: 'black-0',
    _hover: { bg: 'yellow-0', textColor: 'yellow--2' },
  },
  [FractalProposalState.CLOSED]: {
    tooltipKey: 'stateClosedTip',
    bg: 'neutral-8',
    textColor: 'neutral-4',
    _hover: { bg: 'neutral-7', textColor: 'neutral-4' },
  },
  [DAOState.freezeInit]: {
    tooltipKey: 'stateFreezeInitTip',
    bg: 'blue-2',
    textColor: 'blue-0',
    _hover: { bg: 'blue-1', textColor: 'blue-0' },
  },
  [DAOState.frozen]: {
    tooltipKey: 'stateFrozenTip',
    bg: 'blue-1',
    textColor: 'blue--1',
    _hover: { bg: 'blue-2', textColor: 'blue--1' },
  },
  ownerApproved: {
    bg: 'neutral-4',
    textColor: 'neutral-7',
    _hover: { bg: 'neutral-2', textColor: 'neutral-7' },
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
          textStyle="label-base"
          lineHeight="1"
        >
          {t(labelKey)}
        </Text>
        {proposal && (
          <ProposalCountdown
            proposal={proposal}
            showIcon={false}
            textColor={colors.textColor}
            textStyle="label-base"
          />
        )}
      </Flex>
    </Tooltip>
  );
}
