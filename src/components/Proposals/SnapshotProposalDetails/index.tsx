import { GridItem } from '@chakra-ui/react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import { SnapshotProposal } from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import { useProposalCountdown } from '../../ui/proposal/useProposalCountdown';
import { ProposalAction } from '../ProposalActions/ProposalAction';
import { ProposalInfo } from '../ProposalInfo';
// import ProposalSummary from '../ProposalSummary';
// import ProposalVotes from '../ProposalVotes';
import { VoteContextProvider } from '../ProposalVotes/context/VoteContext';

interface ISnapshotProposalDetails {
  proposal: SnapshotProposal;
}

export default function SnapshotProposalDetails({ proposal }: ISnapshotProposalDetails) {
  const {
    readOnly: { user },
  } = useFractal();
  useProposalCountdown(proposal);
  return (
    <ProposalDetailsGrid>
      <GridItem colSpan={2}>
        <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
          <ProposalInfo proposal={proposal} />
        </ContentBox>
        {/* <ProposalVotes proposal={proposal} /> */}
      </GridItem>
      <GridItem>
        {/* <ProposalSummary proposal={proposal} /> */}
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
