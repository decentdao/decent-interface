import { Button, Divider, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  CreateProposalTemplateForm,
  CreateProposalTemplateFormState,
} from '../../types/createProposalTemplate';
import { InputComponent, TextareaComponent } from '../ui/forms/InputComponent';

export interface ProposalTemplateMetadataProps extends FormikProps<CreateProposalTemplateForm> {
  setFormState: (state: CreateProposalTemplateFormState) => void;
}

export default function ProposalTemplateMetadata({
  values: { proposalTemplateMetadata },
  setFieldValue,
  errors: { proposalTemplateMetadata: proposalTemplateMetadataError },
  setFormState,
}: ProposalTemplateMetadataProps) {
  const { t } = useTranslation(['proposalTemplate', 'common']);

  return (
    <>
      <VStack
        align="left"
        spacing={4}
        mt={4}
      >
        <InputComponent
          label={t('proposalTemplateTitle')}
          helper={t('proposalTemplateTitleHelperText')}
          isRequired
          value={proposalTemplateMetadata.title}
          onChange={e => setFieldValue('proposalTemplateMetadata.title', e.target.value)}
          disabled={false}
          testId="metadata.title"
          maxLength={50}
        />
        <TextareaComponent
          label={t('proposalTemplateDescription')}
          helper={t('proposalTemplateDescriptionHelperText')}
          isRequired={false}
          value={proposalTemplateMetadata.description}
          onChange={e => setFieldValue('proposalTemplateMetadata.description', e.target.value)}
          disabled={false}
          rows={3}
          maxLength={300}
        />
      </VStack>
      <Divider
        color="chocolate.700"
        mt={8}
        mb={6}
      />
      <Button
        w="100%"
        onClick={() => setFormState(CreateProposalTemplateFormState.TRANSACTIONS_FORM)}
        isDisabled={!!proposalTemplateMetadataError || !proposalTemplateMetadata.title}
      >
        {t('next', { ns: 'common' })}
      </Button>
    </>
  );
}
