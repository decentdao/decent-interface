import { Button, Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CONTENT_MAXW } from '../../constants/common';
import { DAO_ROUTES } from '../../constants/routes';
import { useCanUserCreateProposal } from '../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { FractalProposal } from '../../types';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalCard from './ProposalCard/ProposalCard';

export function ProposalsList({ proposals }: { proposals: FractalProposal[] }) {
  const {
    node: { daoAddress },
    governance: { loadingProposals, allProposalsLoaded },
  } = useFractal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['proposal', 'common']);
  return (
    <Flex
      flexDirection="column"
      gap="1rem"
      maxW={CONTENT_MAXW}
    >
      {proposals === undefined || loadingProposals ? (
        <Box mt={7}>
          <InfoBoxLoader />
        </Box>
      ) : proposals.length > 0 ? (
        [
          ...proposals.map(proposal => (
            <ProposalCard
              key={proposal.proposalId}
              proposal={proposal}
            />
          )),
          !allProposalsLoaded && <InfoBoxLoader />,
        ]
      ) : (
        <EmptyBox emptyText={t('emptyProposals')}>
          {canUserCreateProposal && daoAddress && (
            <Link to={DAO_ROUTES.proposalNew.relative(addressPrefix, daoAddress)}>
              <Button variant="text">{t('createProposal')}</Button>
            </Link>
          )}
        </EmptyBox>
      )}
    </Flex>
  );
}
