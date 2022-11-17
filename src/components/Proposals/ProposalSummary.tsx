import { Text, Box, Divider, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import useCurrentTimestamp from '../../contexts/blockchainData/useCurrentTimestamp';
import { Proposal } from '../../providers/fractal/types';
import ContentBox from '../ui/ContentBox';
import ProgressBar from '../ui/ProgressBar';

interface SummaryProgressBarProps {
  label: string;
  helperText: string;
  percentage: number;
  requiredPercentage: number;
}
function SummaryProgressBar({
  label,
  helperText,
  percentage,
  requiredPercentage,
}: SummaryProgressBarProps) {
  return (
    <Flex
      flexWrap="wrap"
      marginTop={2}
    >
      <Text
        marginTop={2}
        marginBottom={3}
        textStyle="text-base-sans-regular"
      >
        {label}
      </Text>
      <ProgressBar
        value={percentage}
        requiredValue={requiredPercentage}
      />
      <Text
        textStyle="text-sm-sans-regular"
        marginTop={3}
      >
        {helperText}
      </Text>
    </Flex>
  );
}
export default function ProposalSummary({
  proposal: { startBlock, votes, deadline },
  govTokenTotalSupply,
}: {
  proposal: Proposal;
  govTokenTotalSupply: BigNumber;
}) {
  const { t } = useTranslation(['proposal', 'common', 'sidebar']);
  const startBlockTimeStamp = useCurrentTimestamp(startBlock.toNumber());

  const yesVotesPercentage = votes.yes.div(govTokenTotalSupply).mul(100).toNumber();
  const noVotesPercentage = votes.no.div(govTokenTotalSupply).mul(100).toNumber();
  const quorum = votes.quorum.toNumber();
  const requiredVotesToPass = Math.max(noVotesPercentage + 1, quorum);
  const dateFormat = 'MMM dd, yyyy, h:mm aa';

  return (
    <ContentBox bg="black.900-semi-transparent">
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
          <Text>{format(startBlockTimeStamp * 1000, dateFormat)}</Text>
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
          <Text>{format(deadline * 1000, dateFormat)}</Text>
        </Flex>
        <Divider color="chocolate.700" />
      </Box>
      <Box marginTop={4}>
        <SummaryProgressBar
          label={t('support', { ns: 'sidebar' })}
          helperText={t('proposalSupportSummaryHelper', { count: requiredVotesToPass })}
          percentage={yesVotesPercentage}
          requiredPercentage={requiredVotesToPass}
        />
        <SummaryProgressBar
          label={t('quorum', { ns: 'common' })}
          helperText={t('proposalQuorumSummaryHelper', { count: quorum })}
          percentage={noVotesPercentage}
          requiredPercentage={quorum}
        />
      </Box>
    </ContentBox>
  );
}
