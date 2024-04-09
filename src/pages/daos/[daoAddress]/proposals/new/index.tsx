import { Center } from '@chakra-ui/react';
import ProposalBuilder from '../../../../../components/ProposalBuilder';
import { DEFAULT_PROPOSAL } from '../../../../../components/ProposalBuilder/constants';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import { HEADER_HEIGHT } from '../../../../../constants/common';
import { usePrepareProposal } from '../../../../../hooks/DAO/proposal/usePrepareProposal';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { ProposalBuilderMode } from '../../../../../types';

export default function CreateProposalPage() {
  const {
    node: { daoAddress, safe },
    governance: { type },
  } = useFractal();
  const { prepareProposal } = usePrepareProposal();

  if (!type || !daoAddress || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <ProposalBuilder
      initialValues={{ ...DEFAULT_PROPOSAL, nonce: safe.nonce }}
      mode={ProposalBuilderMode.PROPOSAL}
      prepareProposalData={prepareProposal}
    />
  );
}
