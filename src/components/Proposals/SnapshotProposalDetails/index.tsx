import { GridItem } from '@chakra-ui/react';
import { useEffect } from 'react';
import useSnapshotProposal from '../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { SnapshotProposal } from '../../../types';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import { useProposalCountdown } from '../../ui/proposal/useProposalCountdown';
import { ProposalAction } from '../ProposalActions/ProposalAction';
import { ProposalInfo } from '../ProposalInfo';
import { VoteContextProvider } from '../ProposalVotes/context/VoteContext';
import SnapshotProposalSummary from './SnapshotProposalSummary';
import SnapshotProposalVotes from './SnapshotProposalVotes';

interface ISnapshotProposalDetails {
  proposal: SnapshotProposal;
}

export default function SnapshotProposalDetails({ proposal }: ISnapshotProposalDetails) {
  const {
    readOnly: { user },
  } = useFractal();
  useProposalCountdown(proposal);

  const { loadProposal, extendedSnapshotProposal } = useSnapshotProposal(proposal);

  useEffect(() => {
    loadProposal();
  }, [loadProposal, proposal]);

  return (
    <ProposalDetailsGrid>
      <GridItem colSpan={2}>
        <ProposalInfo proposal={extendedSnapshotProposal || proposal} />
        {!!extendedSnapshotProposal && (
          <SnapshotProposalVotes proposal={extendedSnapshotProposal} />
        )}
      </GridItem>
      <GridItem>
        <SnapshotProposalSummary proposal={extendedSnapshotProposal} />
        {user.address && (
          <VoteContextProvider
            proposal={proposal}
            extendedSnapshotProposal={extendedSnapshotProposal}
          >
            <ProposalAction
              proposal={proposal}
              extendedSnapshotProposal={extendedSnapshotProposal}
              onCastSnapshotVote={loadProposal}
              expandedView
            />
          </VoteContextProvider>
        )}
      </GridItem>
    </ProposalDetailsGrid>
  );
}
