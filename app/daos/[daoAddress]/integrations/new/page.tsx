'use client';

import { Box, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DEFAULT_INTEGRATION } from '../../../../../src/components/CreateIntegration/constants';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import { BASE_ROUTES, DAO_ROUTES } from '../../../../../src/constants/routes';
import useCreateIntegration from '../../../../../src/hooks/DAO/proposal/useCreateIntegration';
import useSubmitProposal from '../../../../../src/hooks/DAO/proposal/useSubmitProposal';
import useDefaultNonce from '../../../../../src/hooks/DAO/useDefaultNonce';
import { useCreateIntegrationSchema } from '../../../../../src/hooks/schemas/createIntegration/useCreateIntegrationSchema';
import { useFractal } from '../../../../../src/providers/Fractal/hooks/useFractal';
import { CreateIntegrationForm } from '../../../../../src/types/createIntegration';

export default function CreateIntegrationPage() {
  const { t } = useTranslation('integration');
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
      onSubmit={values => {
        if (canUserCreateProposal) {
          const proposalData = prepareIntegrationProposal(values);
          submitProposal({
            proposalData,
            nonce,
            pendingToastMessage: t('proposalCreatePendingToastMessage'),
            successToastMessage: t('proposalCreateSuccessToastMessage'),
            failedToastMessage: t('proposalCreateFailureToastMessage'),
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
            </Box>
          </form>
        );
      }}
    </Formik>
  );
}
