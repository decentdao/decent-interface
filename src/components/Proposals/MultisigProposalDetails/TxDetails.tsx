import { Box, Divider, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { MultisigProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/containers/ContentBox';
import InfoRow from '../../ui/proposal/InfoRow';

export function TxDetails({ proposal }: { proposal: MultisigProposal }) {
  const { t } = useTranslation('proposal');
  return (
    <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('proposalId')}
          value={createAccountSubstring(proposal.proposalId)}
        />
        <InfoRow
          property={t('txDetailsSignersCurrent')}
          value={proposal.confirmations.length.toString()}
        />
        <InfoRow
          property={t('txDetailsSignersRequired')}
          value={proposal.signersThreshold?.toString()}
        />
        <InfoRow
          property={t('created')}
          value={format(proposal.eventDate, DEFAULT_DATE_TIME_FORMAT)}
          tooltip={formatInTimeZone(proposal.eventDate, 'GMT', DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('transactionHash')}
          value={proposal.transactionHash ? undefined : '-'}
          txHash={proposal.transactionHash}
        />
        <InfoRow
          property={t('nonce')}
          value={proposal.nonce?.toString()}
        />
      </Box>
    </ContentBox>
  );
}
