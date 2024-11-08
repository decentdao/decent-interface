import * as amplitude from '@amplitude/analytics-browser';
import { Center } from '@chakra-ui/react';
import { useEffect } from 'react';
import { ProposalBuilder } from '../../../../../components/ProposalBuilder';
import { DEFAULT_PROPOSAL } from '../../../../../components/ProposalBuilder/constants';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import { useHeaderHeight } from '../../../../../constants/common';
import { usePrepareProposal } from '../../../../../hooks/DAO/proposal/usePrepareProposal';
import { analyticsEvents } from '../../../../../insights/analyticsEvents';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useProposalActionsStore } from '../../../../../store/actions/useProposalActionsStore';
import { ProposalBuilderMode } from '../../../../../types';

export function SafeProposalWithActionsCreatePage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.CreateProposalPageOpened);
  }, []);
  const {
    node: { daoAddress, safe },
    governance: { type },
  } = useFractal();
  const { prepareProposal } = usePrepareProposal();
  const { getTransactions } = useProposalActionsStore();

  const HEADER_HEIGHT = useHeaderHeight();

  if (!type || !daoAddress || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <ProposalBuilder
      initialValues={{
        ...DEFAULT_PROPOSAL,
        transactions: getTransactions(),
        nonce: safe.nextNonce,
      }}
      mode={ProposalBuilderMode.PROPOSAL_WITH_ACTIONS}
      prepareProposalData={prepareProposal}
    />
  );
}
