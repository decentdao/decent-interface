import { Button, Box, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { FractalProposal, StrategyType } from '../../types';
import { ActivityGovernance } from '../Activity/ActivityGovernance';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';

export function ProposalsList({ proposals }: { proposals: FractalProposal[] }) {
  const {
    node: { daoAddress, safe },
    governance: { type },
    readOnly: { user },
  } = useFractal();

  const showCreateButton =
    type === StrategyType.AZORIUS ? true : safe?.owners.includes(user.address || '');

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
          {showCreateButton && (
            <Link href={DAO_ROUTES.proposalNew.relative(daoAddress)}>
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
