import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { MultisigProposal } from '../../../providers/Fractal/types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/ContentBox';
import EtherscanDisplayNameLink from '../../ui/EtherscanDisplayNameLink';

export function InfoRow({
  property,
  value,
  address,
}: {
  property: string;
  value?: string;
  address?: string | null;
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
      {address ? <EtherscanDisplayNameLink address={address} /> : <Text>{value}</Text>}
    </Flex>
  );
}

export function TxDetails({ proposal }: { proposal: MultisigProposal }) {
  const { t } = useTranslation('proposal');
  const signersRequired = `${proposal.confirmations.length}/${proposal.signersThreshold}`;
  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('txDetailsSigners')}
          value={signersRequired}
        />
        <InfoRow
          property={t('created')}
          value={format(new Date(proposal.eventDate), DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('transactionHash')}
          value={proposal.transactionHash ? undefined : '-'}
          address={proposal.transactionHash}
        />
        <InfoRow
          property={t('safeTXHash')}
          address={proposal.proposalNumber}
        />
      </Box>
    </ContentBox>
  );
}
