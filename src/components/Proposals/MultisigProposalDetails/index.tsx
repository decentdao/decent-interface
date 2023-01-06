import { GridItem, Box } from '@chakra-ui/react';
import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { MultisigProposal, TxProposal } from '../../../providers/Fractal/types';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import ContentBox from '../../ui/ContentBox';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import ProposalCreatedBy from '../../ui/proposal/ProposalCreatedBy';
import { ProposalInfo } from '../ProposalInfo';
import { SignerDetails } from './SignerDetails';
import { TxActions } from './TxActions';
import { TxDetails } from './TxDetails';

export function MultisigProposalDetails({ proposal }: { proposal: TxProposal }) {
  const txProposal = proposal as MultisigProposal;
  const {
    gnosis: {
      guardContracts: { vetoGuardContract },
    },
  } = useFractal();
  const {
    state: { account },
  } = useWeb3Provider();
  return (
    <ProposalDetailsGrid>
      <GridItem colSpan={2}>
        <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
          <ProposalInfo proposal={proposal} />
          <Box mt={4}>
            <ProposalCreatedBy proposalProposer={txProposal.confirmations[0].owner} />
          </Box>
        </ContentBox>
        <SignerDetails proposal={txProposal} />
      </GridItem>
      <GridItem colSpan={1}>
        <TxDetails proposal={txProposal} />
        {account && (
          <TxActions
            proposal={txProposal}
            vetoGuard={vetoGuardContract as VetoGuard}
          />
        )}
      </GridItem>
    </ProposalDetailsGrid>
  );
}
