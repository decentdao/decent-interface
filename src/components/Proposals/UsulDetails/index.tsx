import { Grid, GridItem, Box } from '@chakra-ui/react';
import { ProposalAction } from '../../../components/Proposals/ProposalActions/ProposalAction';
import ProposalSummary from '../../../components/Proposals/ProposalSummary';
import ProposalVotes from '../../../components/Proposals/ProposalVotes';
import ContentBox from '../../../components/ui/ContentBox';
import ProposalCreatedBy from '../../../components/ui/proposal/ProposalCreatedBy';
import { UsulProposal } from '../../../providers/Fractal/types';
import { ProposalInfo } from '../ProposalInfo';

export function UsulProposalDetails({ proposal }: { proposal: UsulProposal }) {
  return (
    <Grid
      gap={4}
      templateColumns="repeat(3, 1fr)"
    >
      <GridItem colSpan={2}>
        <>
          <ContentBox bg="black.900-semi-transparent">
            <ProposalInfo proposal={proposal} />
            <Box mt={4}>
              <ProposalCreatedBy proposalProposer={proposal.proposer} />
            </Box>
          </ContentBox>
          <ProposalVotes proposal={proposal} />
        </>
      </GridItem>
      <GridItem colSpan={1}>
        <ProposalSummary proposal={proposal} />
        <ProposalAction
          proposal={proposal}
          expandedView
        />
      </GridItem>
    </Grid>
  );
}
