import { Button, Divider, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CreateIntegrationForm, CreateIntegrationState } from '../../types/createIntegration';
import { InputComponent, TextareaComponent } from '../ui/forms/InputComponent';

export interface IntegrationMetadataProps extends FormikProps<CreateIntegrationForm> {
  setFormState: (state: CreateIntegrationState) => void;
}

export default function IntegrationMetadata({
  values: { integrationMetadata },
  setFieldValue,
  errors: { integrationMetadata: integrationMetadataError },
  setFormState,
}: IntegrationMetadataProps) {
  const { t } = useTranslation(['integration', 'common']);

  return (
    <>
      <VStack
        align="left"
        spacing={4}
        mt={4}
      >
        <InputComponent
          label={t('integrationTitle')}
          helper={t('integrationTitleHelperText')}
          isRequired
          value={integrationMetadata.title}
          onChange={e => setFieldValue('integrationMetadata.title', e.target.value)}
          disabled={false}
          testId="metadata.title"
        />
        <TextareaComponent
          label={t('integrationDescription')}
          helper={t('integrationDescriptionHelperText')}
          isRequired={false}
          value={integrationMetadata.description}
          onChange={e => setFieldValue('integrationMetadata.description', e.target.value)}
          disabled={false}
          rows={3}
        />
      </VStack>
      <Divider
        color="chocolate.700"
        mt={8}
        mb={6}
      />
      <Button
        w="100%"
        onClick={() => setFormState(CreateIntegrationState.TRANSACTIONS_FORM)}
        disabled={!!integrationMetadataError || !integrationMetadata.title}
      >
        {t('next', { ns: 'common' })}
      </Button>
    </>
  );
}
