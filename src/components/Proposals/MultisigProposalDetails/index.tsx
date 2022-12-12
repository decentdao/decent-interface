import { Grid, GridItem, Box } from '@chakra-ui/react';
import { MultisigProposal, TxProposal } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/ContentBox';
import ProposalCreatedBy from '../../ui/proposal/ProposalCreatedBy';
import { ProposalInfo } from '../ProposalInfo';
import { SignerDetails } from './SignerDetails';
import { TxActions } from './TxActions';
import { TxDetails } from './TxDetails';

export function MultisigProposalDetails({ proposal }: { proposal: TxProposal }) {
  const txProposal = proposal as MultisigProposal;
  return (
    <Grid
      gap={4}
      templateColumns="repeat(3, 1fr)"
    >
      <GridItem colSpan={2}>
        <ContentBox bg="black.900-semi-transparent">
          <ProposalInfo proposal={proposal} />
          <Box mt={4}>
            <ProposalCreatedBy proposalProposer={txProposal.confirmations[0].owner} />
          </Box>
        </ContentBox>
        <SignerDetails proposal={txProposal} />
      </GridItem>
      <GridItem colSpan={1}>
        <TxDetails proposal={txProposal} />
        <TxActions proposal={txProposal} />
      </GridItem>
    </Grid>
  );
}
