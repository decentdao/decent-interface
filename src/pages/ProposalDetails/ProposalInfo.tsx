import { Box, Flex } from '@chakra-ui/react';
import { ActivityDescription } from '../../components/Activity/ActivityDescription';
import ProposalExecutableCode from '../../components/ui/proposal/ProposalExecutableCode';
import ProposalStateBox from '../../components/ui/proposal/ProposalStateBox';
import ProposalTime from '../../components/ui/proposal/ProposalTime';
import { TxProposal, UsulProposal } from '../../providers/Fractal/types';

export function ProposalInfo({ proposal }: { proposal: TxProposal }) {
  const usulProposal = proposal as UsulProposal;
  return (
    <Flex
      alignItems="center"
      flexWrap="wrap"
    >
      <Flex
        gap={4}
        alignItems="center"
      >
        <ProposalStateBox state={proposal.state} />
        {usulProposal.deadline && <ProposalTime deadline={usulProposal.deadline} />}
      </Flex>
      <Box
        w="full"
        mt={4}
      >
        <ActivityDescription activity={proposal} />
        <ProposalExecutableCode proposal={proposal} />
      </Box>
    </Flex>
  );
}
