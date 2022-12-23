import { Box, Flex } from '@chakra-ui/react';
import { TxProposal, UsulProposal } from '../../providers/Fractal/types';
import { ActivityDescription } from '../Activity/ActivityDescription';
import ProposalExecutableCode from '../ui/proposal/ProposalExecutableCode';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';
import ProposalTime from '../ui/proposal/ProposalTime';

export function ProposalInfo({ proposal }: { proposal: TxProposal }) {
  const usulProposal = proposal as UsulProposal;
  return (
    <Box>
      <Flex
        gap={4}
        alignItems="center"
      >
        <ProposalStateBox state={proposal.state} />
        {usulProposal.deadline && <ProposalTime deadline={usulProposal.deadline} />}
      </Flex>
      <Box mt={4}>
        <ActivityDescription activity={proposal} />
        <ProposalExecutableCode proposal={proposal} />
      </Box>
    </Box>
  );
}
