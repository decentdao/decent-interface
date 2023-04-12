import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { MultisigProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/containers/ContentBox';
import DisplayTransaction from '../../ui/links/DisplayTransaction';

export function InfoRow({
  property,
  value,
  txHash,
}: {
  property: string;
  value?: string;
  txHash?: string | null;
}) {
  return (
    <Flex
      marginTop={4}
      justifyContent="space-between"
    >
      <Text
        textStyle="text-base-sans-regular"
        color="chocolate.200"
      >
        {property}
      </Text>
      {txHash ? <DisplayTransaction txHash={txHash} /> : <Text>{value}</Text>}
    </Flex>
  );
}

export function TxDetails({ proposal }: { proposal: MultisigProposal }) {
  const { t } = useTranslation('proposal');
  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('proposalId')}
          value={createAccountSubstring(proposal.proposalNumber)}
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
          value={format(new Date(proposal.eventDate), DEFAULT_DATE_TIME_FORMAT)}
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
