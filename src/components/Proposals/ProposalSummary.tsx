import { Text, Box, Divider, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import useCurrentTimestamp from '../../hooks/utils/useCurrentTimestamp';
import { TxProposal } from '../../providers/Fractal/types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../utils/numberFormats';
import ContentBox from '../ui/ContentBox';
import { ExtendedProgressBar } from '../ui/ProgressBar';

export default function ProposalSummary({
  proposal: { startBlock, votes, deadline },
  govTokenTotalSupply,
}: {
  proposal: TxProposal;
  govTokenTotalSupply: BigNumber;
}) {
  const { t } = useTranslation(['proposal', 'common', 'sidebar']);
  const startBlockTimeStamp = useCurrentTimestamp(startBlock.toNumber());

  const yesVotesPercentage = votes.yes.div(govTokenTotalSupply).mul(100).toNumber();
  const noVotesPercentage = votes.no.div(govTokenTotalSupply).mul(100).toNumber();
  const quorum = votes.quorum.toNumber();
  const requiredVotesToPass = Math.max(noVotesPercentage + 1, quorum);

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
          label={t('support', { ns: 'sidebar' })}
          helperText={t('proposalSupportSummaryHelper', { count: requiredVotesToPass })}
          percentage={yesVotesPercentage}
          requiredPercentage={requiredVotesToPass}
        />
        <ExtendedProgressBar
          label={t('quorum', { ns: 'common' })}
          helperText={t('proposalQuorumSummaryHelper', { count: quorum })}
          percentage={noVotesPercentage}
          requiredPercentage={quorum}
        />
      </Box>
    </ContentBox>
  );
}
