import * as amplitude from '@amplitude/analytics-browser';
import { Center } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, useLocation, useNavigate } from 'react-router-dom';
import {
  ProposalBuilder,
  ShowNonceInputOnMultisig,
} from '../../../../components/ProposalBuilder/ProposalBuilder';
import { TransactionsDetails } from '../../../../components/ProposalBuilder/ProposalDetails';
import { DEFAULT_PROPOSAL_METADATA_TYPE_PROPS } from '../../../../components/ProposalBuilder/ProposalMetadata';
import ProposalTransactionsForm from '../../../../components/ProposalBuilder/ProposalTransactionsForm';
import StepButtons, {
  CreateProposalButton,
  NextButton,
  PreviousButton,
} from '../../../../components/ProposalBuilder/StepButtons';
import { DEFAULT_PROPOSAL } from '../../../../components/ProposalBuilder/constants';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import { useHeaderHeight } from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import { usePrepareProposal } from '../../../../hooks/DAO/proposal/usePrepareProposal';
import { analyticsEvents } from '../../../../insights/analyticsEvents';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfigStore } from '../../../../providers/NetworkConfig/useNetworkConfigStore';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import { CreateProposalSteps } from '../../../../types';

export function SafeProposalCreatePage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.CreateProposalPageOpened);
  }, []);
  const {
    governance: { type },
  } = useFractal();
  const { safe } = useDaoInfoStore();
  const { prepareProposal } = usePrepareProposal();

  const { addressPrefix } = useNetworkConfigStore();

  const HEADER_HEIGHT = useHeaderHeight();
  const location = useLocation();
  const { t } = useTranslation('proposal');
  const navigate = useNavigate();

  if (!type || !safe?.address || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  const prevStepUrl = `${location.pathname.replace(CreateProposalSteps.TRANSACTIONS, CreateProposalSteps.METADATA)}${location.search}`;
  const nextStepUrl = `${location.pathname.replace(CreateProposalSteps.METADATA, CreateProposalSteps.TRANSACTIONS)}${location.search}`;

  const pageHeaderBreadcrumbs = [
    {
      terminus: t('proposals', { ns: 'breadcrumbs' }),
      path: DAO_ROUTES.proposals.relative(addressPrefix, safe.address),
    },
    {
      terminus: t('proposalNew', { ns: 'breadcrumbs' }),
      path: '',
    },
  ];

  const pageHeaderButtonClickHandler = () => {
    navigate(DAO_ROUTES.proposals.relative(addressPrefix, safe.address));
  };

  const stepButtons = ({
    formErrors,
    createProposalBlocked,
  }: {
    formErrors: boolean;
    createProposalBlocked: boolean;
  }) => {
    return (
      <StepButtons
        metadataStepButtons={
          <NextButton
            nextStepUrl={nextStepUrl}
            isDisabled={formErrors}
          />
        }
        transactionsStepButtons={
          <>
            <PreviousButton prevStepUrl={prevStepUrl} />
            <CreateProposalButton isDisabled={createProposalBlocked} />
          </>
        }
      />
    );
  };

  return (
    <ProposalBuilder
      initialValues={{ ...DEFAULT_PROPOSAL, nonce: safe.nextNonce }}
      pageHeaderTitle={t('createProposal', { ns: 'proposal' })}
      pageHeaderBreadcrumbs={pageHeaderBreadcrumbs}
      pageHeaderButtonClickHandler={pageHeaderButtonClickHandler}
      proposalMetadataTypeProps={DEFAULT_PROPOSAL_METADATA_TYPE_PROPS(t)}
      actionsExperience={null}
      stepButtons={stepButtons}
      transactionsDetails={transactions => <TransactionsDetails transactions={transactions} />}
      templateDetails={null}
      streamsDetails={null}
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
