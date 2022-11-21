import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useProposals from '../../providers/fractal/hooks/useProposals';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalCard from './ProposalCard';

export default function ProposalsList() {
  const { proposals } = useProposals();
  const { t } = useTranslation('proposal');

  if (proposals === undefined) {
    return <InfoBoxLoader />;
  }

  if (proposals.length === 0) {
    return <EmptyBox emptyText={t('emptyProposals')} />;
  }

  return (
    <Box>
      {proposals.reverse().map(proposal => (
        <ProposalCard
          key={proposal.proposalNumber.toNumber()}
          proposal={proposal}
        />
      ))}
    </Box>
  );
}
