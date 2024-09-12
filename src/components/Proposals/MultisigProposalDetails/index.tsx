import { GridItem } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { MultisigProposal } from '../../../types';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import { ProposalInfo } from '../ProposalInfo';
import { SignerDetails } from './SignerDetails';
import { TxActions } from './TxActions';
import { TxDetails } from './TxDetails';

export function MultisigProposalDetails({ proposal }: { proposal: MultisigProposal }) {
  const {
    readOnly: { user },
  } = useFractal();
  return (
    <ProposalDetailsGrid>
      <GridItem colSpan={2}>
        <ProposalInfo proposal={proposal} />
        <SignerDetails proposal={proposal} />
      </GridItem>
      <GridItem colSpan={1}>
        <TxDetails proposal={proposal} />
        {user.address && <TxActions proposal={proposal} />}
      </GridItem>
    </ProposalDetailsGrid>
  );
}
