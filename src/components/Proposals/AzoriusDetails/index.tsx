import { GridItem } from '@chakra-ui/react';
import { CONTENT_MAXW } from '../../../constants/common';
import { AzoriusProposal } from '../../../types';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import { useProposalCountdown } from '../../ui/proposal/useProposalCountdown';
import { ProposalInfo } from '../ProposalInfo';
import { AzoriusProposalSummary } from '../ProposalSummary';
import ProposalVotes from '../ProposalVotes';

export function AzoriusProposalDetails({ proposal }: { proposal: AzoriusProposal }) {
  useProposalCountdown(proposal);

  return (
    <ProposalDetailsGrid>
      <GridItem
        colSpan={2}
        gap="1.5rem"
        maxW={CONTENT_MAXW}
      >
        <ProposalInfo proposal={proposal} />
        <ProposalVotes proposal={proposal} />
      </GridItem>
      <GridItem maxW={CONTENT_MAXW}>
        <AzoriusProposalSummary proposal={proposal} />
      </GridItem>
    </ProposalDetailsGrid>
  );
}
