import { Text, Box, Divider, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import useBlockTimestamp from '../../hooks/utils/useBlockTimestamp';
import useDisplayName from '../../hooks/utils/useDisplayName';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { UsulProposal } from '../../providers/Fractal/types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../utils/numberFormats';
import ContentBox from '../ui/containers/ContentBox';
import EtherscanLinkAddress from '../ui/links/EtherscanLinkAddress';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import { ExtendedProgressBar } from '../ui/utils/ProgressBar';
import { InfoRow } from './MultisigProposalDetails/TxDetails';

export default function ProposalSummary({
  proposal: { startBlock, votesSummary, deadline, proposer, eventDate },
}: {
  proposal: UsulProposal;
}) {
  const {
    governance: { governanceToken },
  } = useFractal();
  const { displayName: proposerDisplayName } = useDisplayName(proposer);
  const { t } = useTranslation(['proposal', 'common', 'navigation']);
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
  const quorum = votesSummary.quorum.div(governanceToken.totalSupply.div(100)).toNumber();
  const requiredVotesToPass = Math.max(noVotesPercentage + 1, quorum);

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('created')}
          value={format(new Date(eventDate), DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('proposalSummaryStartDate')}
          value={format(startBlockTimeStamp * 1000, DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('proposalSummaryEndDate')}
          value={format(deadline * 1000, DEFAULT_DATE_TIME_FORMAT)}
        />
        <Flex
          marginTop={4}
          marginBottom={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('proposedBy')}
          </Text>
          <EtherscanLinkAddress address={proposer}>
            <Text color="gold.500">{proposerDisplayName}</Text>
          </EtherscanLinkAddress>
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
      </Box>
    </ContentBox>
  );
}
