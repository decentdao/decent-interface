import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useProposals from '../../providers/fractal/hooks/useProposals';
import ProposalCard from './ProposalCard';

export default function ProposalsList() {
  const { proposals } = useProposals();
  const { t } = useTranslation('proposal');

  if (proposals === undefined) {
    return <Text textStyle="text-sm-sans-regular">{t('loadingProposals')}</Text>;
  }

  if (proposals.length === 0) {
    return <Text textStyle="text-sm-sans-regular">{t('emptyProposals')}</Text>;
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
