import { Flex, Box } from '@chakra-ui/react';
import { Proposal } from '../../providers/fractal/types';
import ContentBox from '../ui/ContentBox';
import StatusBox from '../ui/StatusBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalNumber from '../ui/proposal/ProposalNumber';

function ProposalCardDetailed({ proposal }: { proposal: Proposal }) {
  return (
    <ContentBox>
      <Flex alignItems="center">
        <StatusBox state={proposal.state} />
        <ProposalNumber proposalNumber={proposal.proposalNumber.toNumber()} />
      </Flex>
      <Box>
        <ProposalCreatedBy
          proposalProposer={proposal.proposer}
          includeClipboard
        />
      </Box>
    </ContentBox>
  );
}

export default ProposalCardDetailed;
