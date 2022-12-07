import { Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import useBlockTimestamp from '../../hooks/utils/useBlockTimestamp';
import { Proposal, ProposalState } from '../../providers/Fractal/types/usul';
import ContentBox from '../ui/ContentBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalTitle from '../ui/proposal/ProposalTitle';
import { ProposalAction } from './ProposalActions/ProposalAction';

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  const now = new Date();
  const proposalCreatedTimestamp = useBlockTimestamp(proposal.startBlock.toNumber());

  return (
    <Link to={proposal.proposalNumber.toString()}>
      <ContentBox bg="black.900-semi-transparent">
        <Flex justifyContent="space-between">
          <Flex flexWrap="wrap">
            <Flex
              alignItems="center"
              gap={2}
              width="100%"
            >
              <ProposalStateBox state={proposal.state} />
              <ProposalTime
                isRejected={proposal.state === ProposalState.Rejected}
                deadline={proposalCreatedTimestamp}
                icon="calendar"
              />
            </Flex>
            <ProposalTitle proposal={proposal} />
            <ProposalCreatedBy proposalProposer={proposal.proposer} />
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="flex-end"
            gap={8}
            width="30%"
          >
            {proposal.deadline * 1000 > now.getMilliseconds() &&
              proposal.state === ProposalState.Active && (
                <ProposalTime deadline={proposal.deadline} />
              )}
            <ProposalAction proposal={proposal} />
          </Flex>
        </Flex>
      </ContentBox>
    </Link>
  );
}
