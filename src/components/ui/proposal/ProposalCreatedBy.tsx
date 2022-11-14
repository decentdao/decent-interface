import { Flex, Text } from '@chakra-ui/react';
import useDisplayName from '../../../hooks/useDisplayName';
import CopyToClipboard from '../CopyToClipboard';

function ProposalCreatedBy({
  proposalProposer,
  includeClipboard,
}: {
  proposalProposer: string;
  includeClipboard?: boolean;
}) {
  const { displayName: proposerDisplayName } = useDisplayName(proposalProposer);

  return (
    <Flex width="100%">
      <Text>Created By: {proposerDisplayName}</Text>
      {includeClipboard && <CopyToClipboard textToCopy={proposalProposer} />}
    </Flex>
  );
}

export default ProposalCreatedBy;
