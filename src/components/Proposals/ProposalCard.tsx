import { Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import useCurrentTimestamp from '../../contexts/blockchainData/useCurrentTimestamp';
import { Proposal } from '../../providers/fractal/types/usul';
import ContentBox from '../ui/ContentBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalTitle from '../ui/proposal/ProposalTitle';
import { ProposalAction } from './ProposalActions/ProposalAction';

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  const now = new Date();
  const proposalCreatedTimestamp = useCurrentTimestamp(proposal.startBlock.toNumber());

  return (
    <Link to={proposal.proposalNumber.toString()}>
      <ContentBox>
        <Flex justifyContent="space-between">
          <Flex flexWrap="wrap">
            <Flex
              alignItems="center"
              gap={2}
              width="100%"
            >
              <ProposalStateBox state={proposal.state} />
              <ProposalTime
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
            {proposal.deadline * 1000 > now.getMilliseconds() && (
              <ProposalTime deadline={proposal.deadline} />
            )}
            <ProposalAction proposal={proposal} />
          </Flex>
        </Flex>
      </ContentBox>
    </Link>
  );
}
