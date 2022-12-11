import { Box, Divider, Grid, GridItem, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { MultisigProposal, TxProposalState } from '../../../providers/Fractal/types';
import { ActivityAddress } from '../../Activity/ActivityAddress';
import ContentBox from '../../ui/ContentBox';
import { Badge } from '../../ui/badges/Badge';

function OwnerInfoRow({ owner, proposal }: { owner: string; proposal: MultisigProposal }) {
  const ownerConfirmed = proposal.confirmations.find(confirmInfo => confirmInfo.owner === owner);

  return (
    <Grid
      templateColumns="1fr auto 1fr"
      my="0.75rem"
    >
      <GridItem colSpan={1}>
        <ActivityAddress address={owner} />
      </GridItem>
      <GridItem colSpan={1}>
        {ownerConfirmed && (
          <Badge
            labelKey={TxProposalState.Approved}
            size="sm"
          />
        )}
      </GridItem>
      <GridItem
        colSpan={1}
        placeSelf="end"
      >
        {ownerConfirmed && (
          <Text>{format(new Date(ownerConfirmed.submissionDate), 'MMM dd yyyy hh:mm:ss')}</Text>
        )}
      </GridItem>
    </Grid>
  );
}

export function SignerDetails({ proposal }: { proposal: MultisigProposal }) {
  const {
    gnosis: {
      safe: { owners },
    },
  } = useFractal();
  const { t } = useTranslation('proposal');
  if (!owners) {
    return null;
  }
  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">{t('signers')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <Box marginTop={4}>
          {owners.map(owner => (
            <OwnerInfoRow
              key={owner}
              owner={owner}
              proposal={proposal}
            />
          ))}
        </Box>
      </Box>
    </ContentBox>
  );
}
