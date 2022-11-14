import { Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Proposal } from '../../providers/fractal/types/usul';
import ContentBox from '../ui/ContentBox';
import StatusBox from '../ui/StatusBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalNumber from '../ui/proposal/ProposalNumber';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalTitle from '../ui/proposal/ProposalTitle';
import { ProposalAction } from './ProposalAction';

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link to={proposal.proposalNumber.toString()}>
      <ContentBox>
        <Flex justifyContent="space-between">
          <Flex>
            <Flex
              alignItems="center"
              gap="2"
            >
              <ProposalNumber proposalNumber={proposal.proposalNumber.toNumber()} />
              <StatusBox state={proposal.state} />
            </Flex>
            <ProposalTitle proposal={proposal} />
            <ProposalCreatedBy proposalProposer={proposal.proposer} />
          </Flex>
          <Flex>
            {proposal.deadline && <ProposalTime deadline={proposal.deadline} />}
            <ProposalAction proposal={proposal} />
          </Flex>
        </Flex>
      </ContentBox>
    </Link>
  );
}
