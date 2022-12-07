import { Flex } from '@chakra-ui/react';
import { MouseEvent, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useBlockTimestamp from '../../hooks/utils/useBlockTimestamp';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { MultisigTransaction, TxProposalState, UsulProposal } from '../../providers/Fractal/types';
import { DAO_ROUTES } from '../../routes/constants';
import { Badge } from '../ui/badges/Badge';
import { ActivityBox } from '../ui/containers/ActivityBox';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalTitle from '../ui/proposal/ProposalTitle';
import { ProposalAction } from './ProposalActions/ProposalAction';

export default function ProposalCard({
  proposal,
}: {
  proposal: UsulProposal | MultisigTransaction;
}) {
  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();
  const now = new Date();
  const usulProposal = proposal as UsulProposal;
  const multisigTransaction = proposal as MultisigTransaction;
  const actionRef = useRef<HTMLDivElement>(null);

  const proposalCreatedTimestamp = useBlockTimestamp(
    usulProposal.startBlock ? usulProposal.startBlock.toNumber() : undefined
  );

  const navigate = useNavigate();

  const viewProposal = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target !== actionRef.current) {
        navigate(DAO_ROUTES.proposal.relative(address));
      }
    },
    [navigate, actionRef, address]
  );

  return (
    <ActivityBox>
      <Flex
        minHeight="4.25rem"
        justifyContent="space-between"
        onClick={viewProposal}
      >
        <Flex
          flexDirection="column"
          justifyContent="space-between"
        >
          <Flex
            alignItems="center"
            gap={2}
          >
            <Badge
              labelKey={proposal.state}
              size="base"
            />
            <ProposalTime
              isRejected={proposal.state === TxProposalState.Rejected}
              submissionDate={multisigTransaction.submissionDate}
              deadline={proposalCreatedTimestamp}
              icon="calendar"
            />
          </Flex>
          <ProposalTitle proposal={proposal} />
        </Flex>
        <Flex
          alignItems="center"
          justifyContent="flex-end"
          gap={8}
          width="30%"
          ref={actionRef}
        >
          {usulProposal.deadline &&
            usulProposal.deadline * 1000 > now.getMilliseconds() &&
            proposal.state === TxProposalState.Active && (
              <ProposalTime deadline={usulProposal.deadline} />
            )}
          <ProposalAction proposal={proposal} />
        </Flex>
      </Flex>
    </ActivityBox>
  );
}
