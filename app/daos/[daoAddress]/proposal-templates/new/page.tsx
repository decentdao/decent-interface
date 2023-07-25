'use client';

import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { Formik, FormikProps } from 'formik';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProposalTemplateDetails from '../../../../../src/components/CreateProposalTemplate/ProposalTemplateDetails';
import ProposalTemplateMetadata from '../../../../../src/components/CreateProposalTemplate/ProposalTemplateMetadata';
import ProposalTemplateTransactionsForm from '../../../../../src/components/CreateProposalTemplate/ProposalTemplateTransactionsForm';
import { DEFAULT_PROPOSAL_TEMPLATE } from '../../../../../src/components/CreateProposalTemplate/constants';
import { CustomNonceInput } from '../../../../../src/components/ui/forms/CustomNonceInput';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../../src/components/ui/utils/ClientOnly';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../../../src/constants/common';
import { BASE_ROUTES, DAO_ROUTES } from '../../../../../src/constants/routes';
import { logError } from '../../../../../src/helpers/errorLogging';
import useCreateProposalTemplate from '../../../../../src/hooks/DAO/proposal/useCreateProposalTemplate';
import useSubmitProposal from '../../../../../src/hooks/DAO/proposal/useSubmitProposal';
import useCreateProposalTemplateSchema from '../../../../../src/hooks/schemas/createProposalTemplate/useCreateProposalTemplateSchema';
import { useFractal } from '../../../../../src/providers/App/AppProvider';
import useIPFSClient from '../../../../../src/providers/App/hooks/useIPFSClient';
import {
  CreateProposalTemplateForm,
  CreateProposalTemplateFormState,
  ProposalTemplate,
} from '../../../../../src/types/createProposalTemplate';

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

export default function CreateProposalTemplatePage() {
  const [formState, setFormState] = useState(CreateProposalTemplateFormState.METADATA_FORM);
  const [initialProposalTemplate, setInitialProposalTemplate] = useState(DEFAULT_PROPOSAL_TEMPLATE);
  const { t } = useTranslation(['proposalTemplate', 'proposal']);

  const { push } = useRouter();
  const searchParams = useSearchParams();
  const defaultProposalTemplatesHash = useMemo(
    () => searchParams?.get('templatesHash'),
    [searchParams]
  );
  const defaultProposalTemplateIndex = useMemo(
    () => searchParams?.get('templateIndex'),
    [searchParams]
  );

  const {
    node: { daoAddress, safe },
  } = useFractal();

  const { prepareProposalTemplateProposal } = useCreateProposalTemplate();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const { createProposalTemplateValidation } = useCreateProposalTemplateSchema();
  const ipfsClient = useIPFSClient();

  const successCallback = () => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see Proposal for Proposal Template creation
      push(`/daos/${daoAddress}/proposals`);
    }
  };

  useEffect(() => {
    const loadInitialTemplate = async () => {
      if (defaultProposalTemplatesHash && defaultProposalTemplateIndex) {
        try {
          const proposalTemplates = await ipfsClient.cat(defaultProposalTemplatesHash);
          const initialTemplate: ProposalTemplate = proposalTemplates[defaultProposalTemplateIndex];
          if (initialTemplate) {
            const newInitialValue = {
              nonce: undefined,
              proposalTemplateMetadata: {
                title: initialTemplate.title,
                description: initialTemplate.description || '',
              },
              transactions: initialTemplate.transactions.map(tx => ({
                ...tx,
                ethValue: {
                  value: tx.ethValue.value,
                  bigNumerValue: BigNumber.from(tx.ethValue.value || 0),
                },
              })),
            };
            setInitialProposalTemplate(newInitialValue);
          }
        } catch (e) {
          logError('Error while fetching initial template values', e);
        }
      }
    };
    loadInitialTemplate();
  }, [defaultProposalTemplatesHash, defaultProposalTemplateIndex, ipfsClient]);

  return (
    <ClientOnly>
      <Formik<CreateProposalTemplateForm>
        validationSchema={createProposalTemplateValidation}
        initialValues={initialProposalTemplate}
        enableReinitialize
        onSubmit={async values => {
          if (canUserCreateProposal) {
            const proposalData = await prepareProposalTemplateProposal(values);
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
        {(formikProps: FormikProps<CreateProposalTemplateForm>) => {
          const { handleSubmit } = formikProps;

          return (
            <form onSubmit={handleSubmit}>
              <Box>
                <PageHeader
                  title={t('createProposalTemplate')}
                  breadcrumbs={[
                    {
                      terminus: t('proposalTemplates', { ns: 'breadcrumbs' }),
                      path: DAO_ROUTES.proposalTemplates.relative(daoAddress),
                    },
                    {
                      terminus: t('proposalTemplateNew', { ns: 'breadcrumbs' }),
                      path: '',
                    },
                  ]}
                  ButtonIcon={Trash}
                  buttonVariant="secondary"
                  buttonClick={() =>
                    push(
                      daoAddress
                        ? DAO_ROUTES.proposalTemplates.relative(daoAddress)
                        : BASE_ROUTES.landing
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
                        {formState === CreateProposalTemplateFormState.METADATA_FORM ? (
                          <ProposalTemplateMetadata
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
                                {formikProps.values.proposalTemplateMetadata.title}
                              </Text>
                              <CustomNonceInput
                                nonce={formikProps.values.nonce}
                                onChange={newNonce => formikProps.setFieldValue('nonce', newNonce)}
                                align="end"
                              />
                            </Flex>
                            <ProposalTemplateTransactionsForm
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
                    <ProposalTemplateDetails {...formikProps} />
                  </GridItem>
                </Grid>
              </Box>
            </form>
          );
        }}
      </Formik>
    </ClientOnly>
  );
}
