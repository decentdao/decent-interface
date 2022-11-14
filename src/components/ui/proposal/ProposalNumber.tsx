import { Text } from '@chakra-ui/react';

function ProposalNumber({ proposalNumber }: { proposalNumber: number }) {
  return <Text textStyle="text-xl-mono-bold">#{proposalNumber}</Text>;
}

export default ProposalNumber;
