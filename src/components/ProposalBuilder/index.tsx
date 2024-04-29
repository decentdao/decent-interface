import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';
import { Trash } from '@phosphor-icons/react';
import { Formik, FormikProps } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES, BASE_ROUTES } from '../../constants/routes';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import useCreateProposalSchema from '../../hooks/schemas/proposalBuilder/useCreateProposalSchema';
import { useCanUserCreateProposal } from '../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { CreateProposalState, ProposalExecuteData } from '../../types';
import { CreateProposalForm, ProposalBuilderMode } from '../../types/proposalBuilder';
import { CustomNonceInput } from '../ui/forms/CustomNonceInput';
import PageHeader from '../ui/page/Header/PageHeader';
import ProposalDetails from './ProposalDetails';
import ProposalMetadata from './ProposalMetadata';
import ProposalTransactionsForm from './ProposalTransactionsForm';
import StateButtons from './StateButtons';

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
  const [formState, setFormState] = useState(CreateProposalState.METADATA_FORM);
  const { t } = useTranslation(['proposalTemplate', 'proposal']);

  const isProposalMode = mode === ProposalBuilderMode.PROPOSAL;

  const navigate = useNavigate();
  const {
    node: { daoAddress, safe },
    readOnly: { dao },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { submitProposal, pendingCreateTx } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { createProposalValidation } = useCreateProposalSchema();

  const successCallback = () => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see Proposal for Proposal Template creation
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  };

  return (
    <Formik<CreateProposalForm>
      validationSchema={createProposalValidation}
      initialValues={initialValues}
      enableReinitialize
      onSubmit={async values => {
        if (canUserCreateProposal) {
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
                buttonVariant="secondary"
                buttonClick={() =>
                  navigate(
                    daoAddress
                      ? isProposalMode
                        ? DAO_ROUTES.proposals.relative(addressPrefix, daoAddress)
                        : DAO_ROUTES.proposalTemplates.relative(addressPrefix, daoAddress)
                      : BASE_ROUTES.landing,
                  )
                }
                isButtonDisabled={pendingCreateTx}
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
                      {formState === CreateProposalState.METADATA_FORM ? (
                        <ProposalMetadata
                          mode={mode}
                          {...formikProps}
                        />
                      ) : (
                        <ProposalTransactionsForm
                          pendingTransaction={pendingCreateTx}
                          safeNonce={safe?.nonce}
                          mode={mode}
                          {...formikProps}
                        />
                      )}
                    </Box>
                    {formState === CreateProposalState.TRANSACTIONS_FORM && !dao?.isAzorius && (
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
                          onChange={newNonce => formikProps.setFieldValue('nonce', newNonce)}
                          align="end"
                        />
                      </Flex>
                    )}
                    <StateButtons
                      {...formikProps}
                      mode={mode}
                      formState={formState}
                      setFormState={setFormState}
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
