import { Text, Box, Divider } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { SnapshotProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/containers/ContentBox';
import { InfoRow } from '../MultisigProposalDetails/TxDetails';

interface ISnapshotProposalSummary {
  proposal: SnapshotProposal;
}

export default function SnapshotProposalSummary({ proposal }: ISnapshotProposalSummary) {
  const { t } = useTranslation(['proposal', 'common', 'navigation']);
  return (
    <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('proposalSummaryStartDate')}
          value={format(proposal.startTime * 1000, DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('proposalSummaryEndDate')}
          value={format(proposal.endTime * 1000, DEFAULT_DATE_TIME_FORMAT)}
        />
        <Divider color="chocolate.700" />
      </Box>
    </ContentBox>
  );
}
