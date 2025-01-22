import * as amplitude from '@amplitude/analytics-browser';
import { Center, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, useLocation, useNavigate } from 'react-router-dom';
import {
  ProposalBuilder,
  ShowNonceInputOnMultisig,
} from '../../../../../components/ProposalBuilder';
import { ProposalActionCard } from '../../../../../components/ProposalBuilder/ProposalActionCard';
import { TransactionsDetails } from '../../../../../components/ProposalBuilder/ProposalDetails';
import { DEFAULT_PROPOSAL_METADATA_TYPE_PROPS } from '../../../../../components/ProposalBuilder/ProposalMetadata';
import ProposalTransactionsForm from '../../../../../components/ProposalBuilder/ProposalTransactionsForm';
import { CreateProposalButton } from '../../../../../components/ProposalBuilder/StepButtons';
import { DEFAULT_PROPOSAL } from '../../../../../components/ProposalBuilder/constants';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import { AddActions } from '../../../../../components/ui/modals/AddActions';
import { SendAssetsData } from '../../../../../components/ui/modals/SendAssetsModal';
import { useHeaderHeight } from '../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { usePrepareProposal } from '../../../../../hooks/DAO/proposal/usePrepareProposal';
import { analyticsEvents } from '../../../../../insights/analyticsEvents';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfigStore } from '../../../../../providers/NetworkConfig/useNetworkConfigStore';
import { useProposalActionsStore } from '../../../../../store/actions/useProposalActionsStore';
import { useDaoInfoStore } from '../../../../../store/daoInfo/useDaoInfoStore';
import { CreateProposalSteps, ProposalActionType } from '../../../../../types';

function ActionsExperience() {
  const { t } = useTranslation('actions');
  const { actions, addAction } = useProposalActionsStore();

  const handleAddSendAssetsAction = (data: SendAssetsData) => {
    addAction({
      actionType: ProposalActionType.TRANSFER,
      content: <></>,
      transactions: [
        {
          targetAddress: data.asset.tokenAddress,
          ethValue: {
            bigintValue: 0n,
            value: '0',
          },
          functionName: 'transfer',
          parameters: [
            { signature: 'address', value: data.destinationAddress },
            { signature: 'uint256', value: data.transferAmount.toString() },
          ],
        },
      ],
    });
  };

  return (
    <Flex
      flexDirection="column"
      gap="1.5rem"
    >
      <Flex
        flexDirection="column"
        gap="0.5rem"
      >
        <Flex
          mt={6}
          mb={2}
          alignItems="center"
        >
          <Text ml={2}>{t('actions', { ns: 'actions' })}</Text>
        </Flex>
        {actions.map((action, index) => {
          return (
            <ProposalActionCard
              key={index}
              action={action}
              index={index}
              canBeDeleted={actions.length > 1}
            />
          );
        })}
      </Flex>
      <Flex>
        <AddActions addSendAssetsAction={handleAddSendAssetsAction} />
      </Flex>
    </Flex>
  );
}

export function SafeProposalWithActionsCreatePage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.SafeProposalWithActionsCreatePageOpened);
  }, []);
  const {
    governance: { type },
  } = useFractal();
  const { safe } = useDaoInfoStore();

  const { prepareProposal } = usePrepareProposal();
  const { getTransactions } = useProposalActionsStore();
  const { addressPrefix } = useNetworkConfigStore();

  const HEADER_HEIGHT = useHeaderHeight();
  const location = useLocation();
  const { t } = useTranslation('proposal');
  const navigate = useNavigate();
  const { resetActions } = useProposalActionsStore();

  if (!type || !safe?.address || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  const prevStepUrl = `${location.pathname.replace(CreateProposalSteps.TRANSACTIONS, CreateProposalSteps.METADATA)}${location.search}`;

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
    resetActions();
    navigate(DAO_ROUTES.proposals.relative(addressPrefix, safe.address));
  };

  const metadataStepButtons = (isDisabled: boolean) => {
    return <CreateProposalButton isDisabled={isDisabled} />;
  };

  return (
    <ProposalBuilder
      initialValues={{
        ...DEFAULT_PROPOSAL,
        transactions: getTransactions(),
        nonce: safe.nextNonce,
      }}
      pageHeaderTitle={t('createProposal', { ns: 'proposal' })}
      pageHeaderBreadcrumbs={pageHeaderBreadcrumbs}
      pageHeaderButtonClickHandler={pageHeaderButtonClickHandler}
      actionsExperience={<ActionsExperience />}
      metadataStepButtons={metadataStepButtons}
      transactionsDetails={transactions => <TransactionsDetails transactions={transactions} />}
      templateDetails={null}
      streamsDetails={null}
      proposalMetadataTypeProps={DEFAULT_PROPOSAL_METADATA_TYPE_PROPS(t)}
      prevStepUrl={prevStepUrl}
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
