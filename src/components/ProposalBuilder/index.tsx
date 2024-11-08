import { Box, Flex, Grid, GridItem, Icon, Text } from '@chakra-ui/react';
import { SquaresFour, Trash } from '@phosphor-icons/react';
import { Formik, FormikProps } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BASE_ROUTES, DAO_ROUTES } from '../../constants/routes';
import { logError } from '../../helpers/errorLogging';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import useCreateProposalSchema from '../../hooks/schemas/proposalBuilder/useCreateProposalSchema';
import { useCanUserCreateProposal } from '../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useProposalActionsStore } from '../../store/actions/useProposalActionsStore';
import { CreateProposalSteps, ProposalExecuteData } from '../../types';
import {
  CreateProposalForm,
  ProposalActionType,
  ProposalBuilderMode,
} from '../../types/proposalBuilder';
import { CustomNonceInput } from '../ui/forms/CustomNonceInput';
import { AddActions } from '../ui/modals/AddActions';
import { SendAssetsData } from '../ui/modals/SendAssetsModal';
import PageHeader from '../ui/page/Header/PageHeader';
import { ProposalActionCard } from './ProposalActionCard';
import ProposalDetails from './ProposalDetails';
import ProposalMetadata from './ProposalMetadata';
import ProposalTransactionsForm from './ProposalTransactionsForm';
import StepButtons from './StepButtons';

interface ProposalBuilderProps {
  mode: ProposalBuilderMode;
  prepareProposalData: (values: CreateProposalForm) => Promise<ProposalExecuteData | undefined>;
  initialValues: CreateProposalForm;
}

export function ProposalBuilder({
  mode,
  initialValues,
  prepareProposalData,
}: ProposalBuilderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['proposalTemplate', 'proposal']);

  const paths = location.pathname.split('/');
  const step = (paths[paths.length - 1] || paths[paths.length - 2]) as
    | CreateProposalSteps
    | undefined;
  const isProposalMode =
    mode === ProposalBuilderMode.PROPOSAL || mode === ProposalBuilderMode.PROPOSAL_WITH_ACTIONS;

  const {
    node: { daoAddress, safe },
    readOnly: { dao },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { submitProposal, pendingCreateTx } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { createProposalValidation } = useCreateProposalSchema();
  const { addAction, actions, resetActions } = useProposalActionsStore();

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

  const successCallback = () => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see newly created Proposal
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  };

  useEffect(() => {
    if (daoAddress && (!step || !Object.values(CreateProposalSteps).includes(step))) {
      navigate(DAO_ROUTES.proposalNew.relative(addressPrefix, daoAddress), { replace: true });
    }
  }, [daoAddress, step, navigate, addressPrefix]);

  return (
    <Formik<CreateProposalForm>
      validationSchema={createProposalValidation}
      initialValues={initialValues}
      enableReinitialize
      onSubmit={async values => {
        if (!canUserCreateProposal) {
          toast.error(t('errorNotProposer', { ns: 'common' }));
        }

        try {
          const proposalData = await prepareProposalData(values);
          if (proposalData) {
            submitProposal({
              proposalData,
              nonce: values?.nonce,
              pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
              successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
              failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
              successCallback,
            });
          }
        } catch (e) {
          logError(e);
          toast.error(t('encodingFailedMessage', { ns: 'proposal' }));
        }
      }}
    >
      {(formikProps: FormikProps<CreateProposalForm>) => {
        const { handleSubmit } = formikProps;

        if (!daoAddress) {
          return;
        }

        return (
          <form onSubmit={handleSubmit}>
            <Box>
              <PageHeader
                title={
                  isProposalMode
                    ? t('createProposal', { ns: 'proposal' })
                    : t('createProposalTemplate', { ns: 'proposalTemplate' })
                }
                breadcrumbs={
                  isProposalMode
                    ? [
                        {
                          terminus: t('proposals', { ns: 'breadcrumbs' }),
                          path: DAO_ROUTES.proposals.relative(addressPrefix, daoAddress),
                        },
                        {
                          terminus: t('proposalNew', { ns: 'breadcrumbs' }),
                          path: '',
                        },
                      ]
                    : [
                        {
                          terminus: t('proposalTemplates', { ns: 'breadcrumbs' }),
                          path: DAO_ROUTES.proposalTemplates.relative(addressPrefix, daoAddress),
                        },
                        {
                          terminus: t('proposalTemplateNew', { ns: 'breadcrumbs' }),
                          path: '',
                        },
                      ]
                }
                ButtonIcon={Trash}
                buttonProps={{
                  isDisabled: pendingCreateTx,
                  variant: 'secondary',
                  onClick: () => {
                    if (mode === ProposalBuilderMode.PROPOSAL_WITH_ACTIONS && actions.length > 0) {
                      resetActions();
                    }
                    navigate(
                      daoAddress
                        ? isProposalMode
                          ? DAO_ROUTES.proposals.relative(addressPrefix, daoAddress)
                          : DAO_ROUTES.proposalTemplates.relative(addressPrefix, daoAddress)
                        : BASE_ROUTES.landing,
                    );
                  },
                }}
              />
              <Grid
                gap={4}
                marginTop="3rem"
                templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                templateAreas={{
                  base: '"content" "details"',
                  lg: '"content details"',
                }}
              >
                <GridItem area="content">
                  <Flex
                    flexDirection="column"
                    align="left"
                  >
                    <Box
                      marginBottom="2rem"
                      rounded="lg"
                      bg="neutral-2"
                    >
                      <Routes>
                        <Route
                          path={CreateProposalSteps.METADATA}
                          element={
                            <ProposalMetadata
                              mode={mode}
                              {...formikProps}
                            />
                          }
                        />
                        <Route
                          path={CreateProposalSteps.TRANSACTIONS}
                          element={
                            <>
                              <ProposalTransactionsForm
                                pendingTransaction={pendingCreateTx}
                                safeNonce={safe?.nextNonce}
                                mode={mode}
                                {...formikProps}
                              />
                              {!dao?.isAzorius && (
                                <Flex
                                  alignItems="center"
                                  justifyContent="space-between"
                                  marginBottom="2rem"
                                  rounded="lg"
                                  p="1.5rem"
                                  bg="neutral-2"
                                >
                                  <CustomNonceInput
                                    nonce={formikProps.values.nonce}
                                    onChange={newNonce =>
                                      formikProps.setFieldValue('nonce', newNonce)
                                    }
                                    align="end"
                                    renderTrimmed={false}
                                  />
                                </Flex>
                              )}
                            </>
                          }
                        />
                        <Route
                          path="*"
                          element={
                            <Navigate
                              to={`${CreateProposalSteps.METADATA}${location.search}`}
                              replace
                            />
                          }
                        />
                      </Routes>
                    </Box>
                    {mode === ProposalBuilderMode.PROPOSAL_WITH_ACTIONS && (
                      <Flex
                        flexDirection="column"
                        gap="1.5rem"
                      >
                        <Flex
                          flexDirection="column"
                          gap="0.5rem"
                        >
                          <Flex
                            mt={4}
                            mb={2}
                            alignItems="center"
                          >
                            <Icon
                              as={SquaresFour}
                              w="1.5rem"
                              h="1.5rem"
                            />
                            <Text
                              textStyle="display-lg"
                              ml={2}
                            >
                              {t('actions', { ns: 'actions' })}
                            </Text>
                          </Flex>
                          {actions.map((action, index) => {
                            return (
                              <ProposalActionCard
                                key={index}
                                action={action}
                                index={index}
                              />
                            );
                          })}
                        </Flex>
                        <AddActions addSendAssetsAction={handleAddSendAssetsAction} />
                      </Flex>
                    )}
                    <StepButtons
                      {...formikProps}
                      mode={mode}
                      canUserCreateProposal={canUserCreateProposal}
                      pendingTransaction={pendingCreateTx}
                    />
                  </Flex>
                </GridItem>
                <GridItem
                  area="details"
                  w="100%"
                >
                  <ProposalDetails
                    {...formikProps}
                    mode={mode}
                  />
                </GridItem>
              </Grid>
            </Box>
          </form>
        );
      }}
    </Formik>
  );
}
