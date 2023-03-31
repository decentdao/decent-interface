'use client';

import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IntegrationDetails from '../../../../../src/components/CreateIntegration/IntegrationDetails';
import IntegrationMetadata from '../../../../../src/components/CreateIntegration/IntegrationMetadata';
import IntegrationTransactionsForm from '../../../../../src/components/CreateIntegration/IntegrationTransactionsForm';
import { DEFAULT_INTEGRATION } from '../../../../../src/components/CreateIntegration/constants';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../../../src/constants/common';
import { BASE_ROUTES, DAO_ROUTES } from '../../../../../src/constants/routes';
import useCreateIntegration from '../../../../../src/hooks/DAO/proposal/useCreateIntegration';
import useSubmitProposal from '../../../../../src/hooks/DAO/proposal/useSubmitProposal';
import useDefaultNonce from '../../../../../src/hooks/DAO/useDefaultNonce';
import { useCreateIntegrationSchema } from '../../../../../src/hooks/schemas/createIntegration/useCreateIntegrationSchema';
import { useFractal } from '../../../../../src/providers/Fractal/hooks/useFractal';
import {
  CreateIntegrationForm,
  CreateIntegrationState,
} from '../../../../../src/types/createIntegration';

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

export default function CreateIntegrationPage() {
  const [formState, setFormState] = useState(CreateIntegrationState.METADATA_FORM);
  const { t } = useTranslation(['integration', 'proposal']);
  const { push } = useRouter();

  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();

  const { prepareIntegrationProposal } = useCreateIntegration();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const { createIntegrationValidation } = useCreateIntegrationSchema();
  const nonce = useDefaultNonce();

  const successCallback = () => {
    if (address) {
      // Redirecting to proposals page so that user will see Proposal for Integration creation
      push(`/daos/${address}/proposals`);
    }
  };

  return (
    <Formik<CreateIntegrationForm>
      validationSchema={createIntegrationValidation}
      initialValues={DEFAULT_INTEGRATION}
      onSubmit={async values => {
        if (canUserCreateProposal) {
          const proposalData = await prepareIntegrationProposal(values);
          submitProposal({
            proposalData,
            nonce,
            pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
            successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
            failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
            successCallback,
          });
        }
      }}
    >
      {(formikProps: FormikProps<CreateIntegrationForm>) => {
        const { handleSubmit } = formikProps;
        return (
          <form onSubmit={handleSubmit}>
            <Box>
              <PageHeader
                breadcrumbs={[
                  {
                    title: t('integrations', { ns: 'breadcrumbs' }),
                    path: DAO_ROUTES.integrations.relative(address),
                  },
                  {
                    title: t('integrationNew', { ns: 'breadcrumbs' }),
                    path: '',
                  },
                ]}
                ButtonIcon={Trash}
                buttonVariant="secondary"
                buttonClick={() =>
                  push(address ? DAO_ROUTES.integrations.relative(address) : BASE_ROUTES.landing)
                }
                isButtonDisabled={pendingCreateTx}
              />
              <Text
                textStyle="text-2xl-mono-regular"
                color="grayscale.100"
              >
                {t('createIntegration')}
              </Text>
              <Grid
                mt={8}
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
                      {formState === CreateIntegrationState.METADATA_FORM ? (
                        <IntegrationMetadata
                          setFormState={setFormState}
                          {...formikProps}
                        />
                      ) : (
                        <>
                          <Text
                            textStyle="text-xl-mono-medium"
                            mb={4}
                          >
                            {formikProps.values.integrationMetadata.title}
                          </Text>
                          <IntegrationTransactionsForm
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
                  <IntegrationDetails {...formikProps} />
                </GridItem>
              </Grid>
            </Box>
          </form>
        );
      }}
    </Formik>
  );
}
