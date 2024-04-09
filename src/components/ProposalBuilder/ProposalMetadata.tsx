import { Button, Divider, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CreateProposalState } from '../../types';
import { CreateProposalForm, ProposalBuilderMode } from '../../types/proposalBuilder';
import { InputComponent, TextareaComponent } from '../ui/forms/InputComponent';

export interface ProposalMetadataProps extends FormikProps<CreateProposalForm> {
  setFormState: (state: CreateProposalState) => void;
  mode: ProposalBuilderMode;
}

export default function ProposalMetadata({
  values: { proposalMetadata },
  setFieldValue,
  errors: { proposalMetadata: proposalMetadataError },
  setFormState,
  mode,
}: ProposalMetadataProps) {
  const { t } = useTranslation(['proposalTemplate', 'proposal', 'common']);
  const isProposalMode = mode === ProposalBuilderMode.PROPOSAL;

  return (
    <>
      <VStack
        align="left"
        spacing={4}
        mt={4}
      >
        <InputComponent
          label={
            isProposalMode ? t('proposalTitle', { ns: 'proposal' }) : t('proposalTemplateTitle')
          }
          helper={
            isProposalMode
              ? t('proposalTitleHelper', { ns: 'proposal' })
              : t('proposalTemplateTitleHelperText')
          }
          isRequired
          value={proposalMetadata.title}
          onChange={e => setFieldValue('proposalMetadata.title', e.target.value)}
          disabled={false}
          testId="metadata.title"
          maxLength={50}
        />
        <TextareaComponent
          label={
            isProposalMode
              ? t('proposalDescription', { ns: 'proposal' })
              : t('proposalTemplateDescription')
          }
          subLabel={t('')}
          helper={
            isProposalMode
              ? t('proposalDescriptionHelper', { ns: 'proposal' })
              : t('proposalTemplateDescriptionHelperText')
          }
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
