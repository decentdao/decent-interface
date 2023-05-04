'use client';

import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProposalTemplateDetails from '../../../../../src/components/CreateProposalTemplate/ProposalTemplateDetails';
import ProposalTemplateMetadata from '../../../../../src/components/CreateProposalTemplate/ProposalTemplateMetadata';
import ProposalTemplateTransactionsForm from '../../../../../src/components/CreateProposalTemplate/ProposalTemplateTransactionsForm';
import { DEFAULT_PROPOSAL_TEMPLATE } from '../../../../../src/components/CreateProposalTemplate/constants';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../../src/components/ui/utils/ClientOnly';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../../../src/constants/common';
import { BASE_ROUTES, DAO_ROUTES } from '../../../../../src/constants/routes';
import useCreateProposalTemplate from '../../../../../src/hooks/DAO/proposal/useCreateProposalTemplate';
import useSubmitProposal from '../../../../../src/hooks/DAO/proposal/useSubmitProposal';
import useCreateProposalTemplateSchema from '../../../../../src/hooks/schemas/createProposalTemplate/useCreateProposalTemplateSchema';
import { useFractal } from '../../../../../src/providers/App/AppProvider';
import {
  CreateProposalTemplateForm,
  CreateProposalTemplateFormState,
} from '../../../../../src/types/createProposalTemplate';

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

export default function CreateProposalTemplatePage() {
  const [formState, setFormState] = useState(CreateProposalTemplateFormState.METADATA_FORM);
  const { t } = useTranslation(['proposalTemplate', 'proposal']);
  const { push } = useRouter();

  const {
    node: { daoAddress, safe },
  } = useFractal();

  const { prepareProposalTemplateProposal } = useCreateProposalTemplate();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const { createProposalTemplateValidation } = useCreateProposalTemplateSchema();

  const successCallback = () => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see Proposal for Proposal Template creation
      push(`/daos/${daoAddress}/proposals`);
    }
  };

  return (
    <ClientOnly>
      <Formik<CreateProposalTemplateForm>
        validationSchema={createProposalTemplateValidation}
        initialValues={DEFAULT_PROPOSAL_TEMPLATE}
        onSubmit={async values => {
          if (canUserCreateProposal) {
            const proposalData = await prepareProposalTemplateProposal(values);
            submitProposal({
              proposalData,
              nonce: safe?.nonce,
              pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
              successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
              failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
              successCallback,
            });
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
                            <Text
                              textStyle="text-xl-mono-medium"
                              mb={4}
                            >
                              {formikProps.values.proposalTemplateMetadata.title}
                            </Text>
                            <ProposalTemplateTransactionsForm
                              setFormState={setFormState}
                              canUserCreateProposal={canUserCreateProposal}
                              pendingTransaction={pendingCreateTx}
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
