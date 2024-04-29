import { GridItem } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusProposal } from '../../../types';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import { useProposalCountdown } from '../../ui/proposal/useProposalCountdown';
import { ProposalAction } from '../ProposalActions/ProposalAction';
import { ProposalInfo } from '../ProposalInfo';
import ProposalSummary from '../ProposalSummary';
import ProposalVotes from '../ProposalVotes';
import { VoteContextProvider } from '../ProposalVotes/context/VoteContext';

export function AzoriusProposalDetails({ proposal }: { proposal: AzoriusProposal }) {
  const {
    readOnly: { user },
  } = useFractal();
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
        {user.address && (
          <VoteContextProvider proposal={proposal}>
            <ProposalAction
              proposal={proposal}
              expandedView
            />
          </VoteContextProvider>
        )}
      </GridItem>
    </ProposalDetailsGrid>
  );
}
