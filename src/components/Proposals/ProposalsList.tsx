import { Button, Box, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { TxProposal, GovernanceTypes } from '../../types';
import { ActivityGovernance } from '../Activity/ActivityGovernance';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';

export function ProposalsList({ proposals }: { proposals: TxProposal[] }) {
  const { address: account } = useAccount();

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
        <EmptyBox emptyText={t('emptyProposals')}>
          {showCreateButton && (
            <Link href="new">
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
