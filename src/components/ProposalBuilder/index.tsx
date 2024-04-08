import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { DAO_ROUTES, BASE_ROUTES } from '../../constants/routes';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import useCreateProposalTemplateSchema from '../../hooks/schemas/createProposalTemplate/useCreateProposalTemplateSchema';
import { useCanUserCreateProposal } from '../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { CreateProposalState, ProposalExecuteData } from '../../types';
import { CreateProposalForm } from '../../types/proposalBuilder';
import { CustomNonceInput } from '../ui/forms/CustomNonceInput';
import PageHeader from '../ui/page/Header/PageHeader';
import ProposalDetails from './ProposalDetails';
import ProposalMetadata from './ProposalMetadata';
import ProposalTransactionsForm from './ProposalTransactionsForm';
import { DEFAULT_PROPOSAL_TEMPLATE } from './constants';

interface IProposalBuilder {
  mode: 'proposal' | 'template';
  prepareProposalData: (values: CreateProposalForm) => Promise<ProposalExecuteData | undefined>;
  initialValues: typeof DEFAULT_PROPOSAL_TEMPLATE;
}

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

export default function ProposalBuilder({ mode, initialValues, prepareProposalData }: IProposalBuilder) {
  const [formState, setFormState] = useState(CreateProposalState.METADATA_FORM);
  const { t } = useTranslation(['proposalTemplate', 'proposal']);

  const isProposalMode = mode === 'proposal';

  const navigate = useNavigate();
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { submitProposal, pendingCreateTx } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { createProposalTemplateValidation } = useCreateProposalTemplateSchema();

  const successCallback = () => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see Proposal for Proposal Template creation
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  };

  return (
    <Formik<CreateProposalForm>
      validationSchema={createProposalTemplateValidation}
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
                title={t(isProposalMode ? 'createProposal' : 'createProposalTemplate')}
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
                templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                gridTemplateRows={{ base: '1fr', lg: '5.1em 1fr' }}
                templateAreas={{
                  base: templateAreaSingleCol,
                  lg: templateAreaTwoCol,
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
                      p="1rem"
                      bg={BACKGROUND_SEMI_TRANSPARENT}
                    >
                      {formState === CreateProposalState.METADATA_FORM ? (
                        <ProposalMetadata
                          setFormState={setFormState}
                          {...formikProps}
                        />
                      ) : (
                        <>
                          <Flex
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Text
                              textStyle="text-xl-mono-medium"
                              mb={4}
                            >
                              {formikProps.values.proposalMetadata.title}
                            </Text>
                            <CustomNonceInput
                              nonce={formikProps.values.nonce}
                              onChange={newNonce => formikProps.setFieldValue('nonce', newNonce)}
                              align="end"
                            />
                          </Flex>
                          <ProposalTransactionsForm
                            setFormState={setFormState}
                            canUserCreateProposal={canUserCreateProposal}
                            pendingTransaction={pendingCreateTx}
                            safeNonce={safe?.nonce}
                            {...formikProps}
                          />
                        </>
                      )}
                    </Box>
                  </Flex>
                </GridItem>
                <GridItem
                  area="details"
                  w="100%"
                >
                  <ProposalDetails {...formikProps} />
                </GridItem>
              </Grid>
            </Box>
          </form>
        );
      }}
    </Formik>
  );
}
