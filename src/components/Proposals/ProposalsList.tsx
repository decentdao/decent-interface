import { Button, Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes, TxProposal } from '../../providers/Fractal/types';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { ActivityGovernance } from '../Activity/ActivityGovernance';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';

export function ProposalsList({ proposals }: { proposals: TxProposal[] }) {
  const {
    state: { account },
  } = useWeb3Provider();
  const {
    gnosis: {
      safe: { owners },
    },
    governance: { type },
  } = useFractal();

  const showCreateButton =
    type === GovernanceTypes.GNOSIS_SAFE_USUL ? true : owners?.includes(account || '');

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
            key={proposal.proposalNumber}
            activity={proposal}
          />
        ))
      ) : (
        <EmptyBox
          emptyText={t('emptyProposals')}
          m="2rem 0 0 0"
        >
          {showCreateButton && (
            <Link to="new">
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
