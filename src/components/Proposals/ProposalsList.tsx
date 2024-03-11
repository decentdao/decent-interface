import { Button, Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { DAO_ROUTES } from '../../constants/routes';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { FractalProposal } from '../../types';
import { ActivityGovernance } from '../Activity/ActivityGovernance';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';

export function ProposalsList({ proposals }: { proposals: FractalProposal[] }) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { canUserCreateProposal } = useSubmitProposal();

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
          <ActivityGovernance
            key={proposal.proposalId}
            activity={proposal}
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
