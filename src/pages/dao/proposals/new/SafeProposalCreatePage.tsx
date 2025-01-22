import * as amplitude from '@amplitude/analytics-browser';
import { Center } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { ProposalBuilder, ShowNonceInputOnMultisig } from '../../../../components/ProposalBuilder';
import ProposalTransactionsForm from '../../../../components/ProposalBuilder/ProposalTransactionsForm';
import { DEFAULT_PROPOSAL } from '../../../../components/ProposalBuilder/constants';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import { useHeaderHeight } from '../../../../constants/common';
import { usePrepareProposal } from '../../../../hooks/DAO/proposal/usePrepareProposal';
import { analyticsEvents } from '../../../../insights/analyticsEvents';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import { CreateProposalSteps, ProposalBuilderMode } from '../../../../types';

export function SafeProposalCreatePage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.CreateProposalPageOpened);
  }, []);
  const {
    governance: { type },
  } = useFractal();
  const { safe } = useDaoInfoStore();
  const { prepareProposal } = usePrepareProposal();

  const HEADER_HEIGHT = useHeaderHeight();

  if (!type || !safe?.address || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <ProposalBuilder
      initialValues={{ ...DEFAULT_PROPOSAL, nonce: safe.nextNonce }}
      mode={ProposalBuilderMode.PROPOSAL}
      prepareProposalData={prepareProposal}
      contentRoute={(formikProps, pendingCreateTx, nonce) => {
        return (
          <Route
            path={CreateProposalSteps.TRANSACTIONS}
            element={
              <>
                <ProposalTransactionsForm
                  pendingTransaction={pendingCreateTx}
                  safeNonce={safe?.nextNonce}
                  isProposalMode={true}
                  {...formikProps}
                />
                <ShowNonceInputOnMultisig
                  nonce={nonce}
                  nonceOnChange={newNonce => formikProps.setFieldValue('nonce', newNonce)}
                />
              </>
            }
          />
        );
      }}
    />
  );
}
