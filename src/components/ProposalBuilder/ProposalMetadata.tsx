import { Button, Divider, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CreateProposalState } from '../../types';
import { CreateProposalForm } from '../../types/proposalBuilder';
import { InputComponent, TextareaComponent } from '../ui/forms/InputComponent';

export interface ProposalMetadataProps extends FormikProps<CreateProposalForm> {
  setFormState: (state: CreateProposalState) => void;
}

export default function ProposalMetadata({
  values: { proposalMetadata },
  setFieldValue,
  errors: { proposalMetadata: proposalMetadataError },
  setFormState,
}: ProposalMetadataProps) {
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
          value={proposalMetadata.title}
          onChange={e => setFieldValue('proposalMetadata.title', e.target.value)}
          disabled={false}
          testId="metadata.title"
          maxLength={50}
        />
        <TextareaComponent
          label={t('proposalTemplateDescription')}
          subLabel={t('')}
          helper={t('proposalTemplateDescriptionHelperText')}
          isRequired={false}
          value={proposalMetadata.description}
          onChange={e => setFieldValue('proposalMetadata.description', e.target.value)}
          disabled={false}
          rows={12}
        />
      </VStack>
      <Divider
        color="chocolate.700"
        mt={8}
        mb={6}
      />
      <Button
        w="100%"
        onClick={() => setFormState(CreateProposalState.TRANSACTIONS_FORM)}
        isDisabled={!!proposalMetadataError || !proposalMetadata.title}
      >
        {t('next', { ns: 'common' })}
      </Button>
    </>
  );
}
