import { Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import useCurrentTimestamp from '../../hooks/utils/useCurrentTimestamp';
import { SafeTransaction, TxProposalState, UsulProposal } from '../../providers/Fractal/types';
import ContentBox from '../ui/ContentBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalTitle from '../ui/proposal/ProposalTitle';
import { ProposalAction } from './ProposalActions/ProposalAction';

export default function ProposalCard({ proposal }: { proposal: UsulProposal | SafeTransaction }) {
  const now = new Date();
  const usulProposal = proposal as UsulProposal;
  const multisigTransaction = proposal as SafeTransaction;

  const proposalCreatedTimestamp = useCurrentTimestamp(
    usulProposal.startBlock ? usulProposal.startBlock.toNumber() : undefined
  );

  return (
    <Link to={proposal.proposalNumber}>
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
                isRejected={proposal.state === TxProposalState.Rejected}
                submissionDate={multisigTransaction.submissionDate}
                deadline={proposalCreatedTimestamp}
                icon="calendar"
              />
            </Flex>
            <ProposalTitle proposal={proposal} />
            {usulProposal.deadline && (
              <ProposalCreatedBy proposalProposer={usulProposal.proposer} />
            )}
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="flex-end"
            gap={8}
            width="30%"
          >
            {usulProposal.deadline &&
              usulProposal.deadline * 1000 > now.getMilliseconds() &&
              proposal.state === TxProposalState.Active && (
                <ProposalTime deadline={usulProposal.deadline} />
              )}
            <ProposalAction proposal={proposal} />
          </Flex>
        </Flex>
      </ContentBox>
    </Link>
  );
}
