import { Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Proposal } from '../../providers/fractal/types/usul';
import ContentBox from '../ui/ContentBox';
import StatusBox from '../ui/StatusBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalNumber from '../ui/proposal/ProposalNumber';
import ProposalTitle from './ProposalTitle';

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link to={proposal.proposalNumber.toString()}>
      <ContentBox>
        <Flex
          alignItems="center"
          gap="2"
        >
          <ProposalNumber proposalNumber={proposal.proposalNumber.toNumber()} />
          <StatusBox state={proposal.state} />
        </Flex>
        <ProposalTitle proposal={proposal} />
        <ProposalCreatedBy proposalProposer={proposal.proposer} />
      </ContentBox>
    </Link>
  );
}
