import { Text } from '@chakra-ui/react';
import { Proposal } from '../../../providers/fractal/types';

export default function ProposalTitle({ proposal }: { proposal: Proposal }) {
  return (
    <Text textStyle="text-xl-mono-bold">
      Proposal to execute {proposal.txHashes.length} transactions
    </Text>
  );
}
