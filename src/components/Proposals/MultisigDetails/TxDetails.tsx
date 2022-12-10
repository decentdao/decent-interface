import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { MultisigProposal } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/ContentBox';
import EtherscanDisplayNameLink from '../../ui/EtherscanDisplayNameLink';

export function InfoRow({
  property,
  value,
  address,
}: {
  property: string;
  value?: string;
  address?: string | null;
}) {
  return (
    <Flex
      marginTop={4}
      justifyContent="space-between"
    >
      <Text
        textStyle="text-base-sans-regular"
        color="chocolate.200"
      >
        {property}
      </Text>
      {address ? <EtherscanDisplayNameLink address={address} /> : <Text>{value}</Text>}
    </Flex>
  );
}

export function TxDetails({ proposal }: { proposal: MultisigProposal }) {
  const signersRequired = `${proposal.confirmations.length}/${proposal.signersThreshold}`;
  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">Proposal Details</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property="Signers Required"
          value={signersRequired}
        />
        <InfoRow
          property="Created"
          value={format(new Date(proposal.eventDate), 'MMM dd yyyy hh:mm:ss')}
        />
        <InfoRow
          property="Transaction Hash"
          value={proposal.transactionHash ? undefined : '-'}
          address={proposal.transactionHash}
        />
        <InfoRow
          property="SafeTXHash"
          address={proposal.proposalNumber}
        />
      </Box>
    </ContentBox>
  );
}
