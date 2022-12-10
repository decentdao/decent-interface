import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { createAccountSubstring } from '../../../hooks/DAO/useDAOName';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { MultisigProposal, TxProposalState } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/ContentBox';
import { Badge } from '../../ui/badges/Badge';

function OwnerInfoRow({ owner, proposal }: { owner: string; proposal: MultisigProposal }) {
  const ownerConfirmed = proposal.confirmations.find(confirmInfo => confirmInfo.owner === owner);

  return (
    <Flex
      marginTop={4}
      justifyContent="space-between"
    >
      <Text>{createAccountSubstring(owner)}</Text>
      <Box>
        {ownerConfirmed && (
          <Badge
            labelKey={TxProposalState.Approved}
            size="sm"
          />
        )}
      </Box>
      <Box>
        {ownerConfirmed && (
          <Text>{format(new Date(ownerConfirmed.submissionDate), 'MMM dd yyyy hh:mm:ss')}</Text>
        )}
      </Box>
    </Flex>
  );
}

export function SignerDetails({ proposal }: { proposal: MultisigProposal }) {
  const {
    gnosis: {
      safe: { owners },
    },
  } = useFractal();
  if (!owners) {
    return null;
  }
  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">Signers</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
      </Box>
      {owners.map(owner => (
        <OwnerInfoRow
          key={owner}
          owner={owner}
          proposal={proposal}
        />
      ))}
    </ContentBox>
  );
}
