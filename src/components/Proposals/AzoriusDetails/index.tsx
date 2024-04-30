import { GridItem } from '@chakra-ui/react';
import { AzoriusProposal } from '../../../types';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import { useProposalCountdown } from '../../ui/proposal/useProposalCountdown';
import { ProposalInfo } from '../ProposalInfo';
import ProposalSummary from '../ProposalSummary';
import ProposalVotes from '../ProposalVotes';

export function AzoriusProposalDetails({ proposal }: { proposal: AzoriusProposal }) {
  useProposalCountdown(proposal);

  return (
    <ProposalDetailsGrid>
      <GridItem
        colSpan={2}
        gap="1.5rem"
      >
        <ProposalInfo proposal={proposal} />
        <ProposalVotes proposal={proposal} />
      </GridItem>
      <GridItem>
        <ProposalSummary proposal={proposal} />
      </GridItem>
    </ProposalDetailsGrid>
  );
}
