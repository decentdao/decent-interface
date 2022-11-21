import { Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Proposal } from '../../providers/fractal/types/usul';
import ContentBox from '../ui/ContentBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalNumber from '../ui/proposal/ProposalNumber';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalTitle from '../ui/proposal/ProposalTitle';
import { ProposalAction } from './ProposalActions/ProposalAction';

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link to={proposal.proposalNumber.toString()}>
      <ContentBox>
        <Flex
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Flex flexWrap="wrap">
            <Flex
              alignItems="center"
              gap="2"
              width="100%"
            >
              <ProposalNumber proposalNumber={proposal.proposalNumber.toNumber()} />
              <ProposalStateBox state={proposal.state} />
            </Flex>
            <ProposalTitle proposal={proposal} />
            <ProposalCreatedBy proposalProposer={proposal.proposer} />
          </Flex>
          <Flex
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            {proposal.deadline && <ProposalTime deadline={proposal.deadline} />}
            <ProposalAction proposal={proposal} />
          </Flex>
        </Flex>
      </ContentBox>
    </Link>
  );
}
