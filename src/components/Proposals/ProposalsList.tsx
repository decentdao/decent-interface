import { Button, Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DAO_ROUTES } from '../../constants/routes';
import { useCanUserCreateProposal } from '../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { FractalProposal } from '../../types';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalCard from './ProposalCard/ProposalCard';

export function ProposalsList({ proposals }: { proposals: FractalProposal[] }) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { t } = useTranslation('proposal');
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
            key={proposal.proposalId}
            proposal={proposal}
          />
        ))
      ) : (
        <EmptyBox emptyText={t('emptyProposals')}>
          {canUserCreateProposal && (
            <Link to={DAO_ROUTES.proposalNew.relative(daoAddress)}>
              <Button
                variant="text"
                textStyle="text-xl-mono-bold"
              >
                {t('createProposal')}
              </Button>
            </Link>
          )}
        </EmptyBox>
      )}
    </Flex>
  );
}
