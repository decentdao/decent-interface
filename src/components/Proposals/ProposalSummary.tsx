import { Text, Box, Divider, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import useBlockTimestamp from '../../hooks/utils/useBlockTimestamp';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { UsulProposal } from '../../providers/Fractal/types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../utils/numberFormats';
import ContentBox from '../ui/ContentBox';
import { ExtendedProgressBar } from '../ui/ProgressBar';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';

export default function ProposalSummary({
  proposal: { startBlock, votesSummary, deadline },
}: {
  proposal: UsulProposal;
}) {
  const {
    governance: { governanceToken },
  } = useFractal();
  const { t } = useTranslation(['proposal', 'common', 'sidebar']);
  const startBlockTimeStamp = useBlockTimestamp(startBlock.toNumber());
  const getVotesPercentage = (voteTotal: BigNumber): number => {
    if (!governanceToken || !governanceToken.totalSupply || governanceToken.totalSupply.eq(0)) {
      return 0;
    }

    return voteTotal.div(governanceToken.totalSupply.div(100)).toNumber();
  };

  if (!governanceToken || !governanceToken.totalSupply) {
    return (
      <Box mt={4}>
        <InfoBoxLoader />
      </Box>
    );
  }

  const yesVotesPercentage = getVotesPercentage(votesSummary.yes);
  const noVotesPercentage = getVotesPercentage(votesSummary.no);
  const abstainVotesPercentage = getVotesPercentage(votesSummary.abstain);
  const quorum = votesSummary.quorum.div(governanceToken.totalSupply.div(100)).toNumber();
  const requiredVotesToPass = Math.max(noVotesPercentage + 1, quorum);

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <Flex
          marginTop={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('proposalSummaryStartDate')}
          </Text>
          <Text>{format(startBlockTimeStamp * 1000, DEFAULT_DATE_TIME_FORMAT)}</Text>
        </Flex>
        <Flex
          marginTop={4}
          marginBottom={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('proposalSummaryEndDate')}
          </Text>
          <Text>{format(deadline * 1000, DEFAULT_DATE_TIME_FORMAT)}</Text>
        </Flex>
        <Divider color="chocolate.700" />
      </Box>
      <Box marginTop={4}>
        <ExtendedProgressBar
          label={t('support')}
          helperText={t('proposalSupportSummaryHelper', { count: requiredVotesToPass })}
          percentage={yesVotesPercentage}
          requiredPercentage={requiredVotesToPass}
        />
        <ExtendedProgressBar
          label={t('quorum', { ns: 'common' })}
          helperText={t('proposalQuorumSummaryHelper', { count: quorum })}
          percentage={yesVotesPercentage + noVotesPercentage + abstainVotesPercentage}
          requiredPercentage={quorum}
        />
      </Box>
    </ContentBox>
  );
}
