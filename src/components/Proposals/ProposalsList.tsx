import { Button, Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MultisigTransaction, UsulProposal } from '../../providers/Fractal/types';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalCard from './ProposalCard';

export function ProposalsList({
  proposals,
}: {
  proposals: (MultisigTransaction | UsulProposal)[];
}) {
  const { t } = useTranslation();
  return (
    <Flex
      flexDirection="column"
      gap="1rem"
    >
      {proposals === undefined ? (
        <Box mt={7}>
          <InfoBoxLoader />
        </Box>
      ) : proposals.length > 0 ? (
        proposals.map(proposal => (
          <ProposalCard
            key={proposal.proposalNumber}
            proposal={proposal}
          />
        ))
      ) : (
        <EmptyBox
          emptyText={t('emptyProposals')}
          m="2rem 0 0 0"
        >
          <Link to="new">
            <Button
              variant="text"
              textStyle="text-xl-mono-bold"
            >
              {t('createProposal')}
            </Button>
          </Link>
        </EmptyBox>
      )}
    </Flex>
  );
}
