import { Grid, GridItem, Box } from '@chakra-ui/react';
import ContentBox from '../../components/ui/ContentBox';
import ProposalCreatedBy from '../../components/ui/proposal/ProposalCreatedBy';
import { MultisigProposal, TxProposal } from '../../providers/Fractal/types';
import { ProposalInfo } from './ProposalInfo';

export function SafeTxDetails({ proposal }: { proposal: TxProposal }) {
  const txProposal = proposal as MultisigProposal;
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
              <ProposalCreatedBy proposalProposer={txProposal.confirmations[0]} />
            </Box>
          </ContentBox>
        </>
      </GridItem>
    </Grid>
  );
}
