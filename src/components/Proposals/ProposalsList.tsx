import { Button, Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ActivityGovernance } from '../../pages/DaoDashboard/Activities/ActivityGovernance';
import { GovernanceActivity, UsulProposal } from '../../providers/Fractal/types';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';

export function ProposalsList({ proposals }: { proposals: (GovernanceActivity | UsulProposal)[] }) {
  const { t } = useTranslation('proposals');
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
          <ActivityGovernance
            key={proposal.proposalNumber}
            activity={proposal}
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
