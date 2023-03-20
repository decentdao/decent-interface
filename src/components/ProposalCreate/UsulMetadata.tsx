import { Button, Divider, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CreateProposalForm, CreateProposalState } from '../../types';
import { InputComponent, TextareaComponent } from './InputComponent';

export interface UsulMetadataProps extends FormikProps<CreateProposalForm> {
  isVisible: boolean;
  setFormState: (state: CreateProposalState) => void;
}

function UsulMetadata(props: UsulMetadataProps) {
  const {
    values: { proposalMetadata },
    setFieldValue,
    errors: { proposalMetadata: proposalMetadataError },
    isVisible,
    setFormState,
  } = props;
  const { t } = useTranslation(['proposal', 'common']);

  if (!isVisible) return null;

  return (
    <>
      <VStack
        align="left"
        spacing={4}
        mt={4}
      >
        <InputComponent
          label={t('proposalTitle')}
          helper={t('proposalTitleHelper')}
          isRequired={false}
          value={proposalMetadata.title}
          onChange={e => setFieldValue('proposalMetadata.title', e.target.value)}
          disabled={false}
          placeholder={t('proposalTitlePlaceholder')}
          testId="metadata.title"
        />
        <TextareaComponent
          label={t('proposalDescription')}
          helper={t('proposalDescriptionHelper')}
          isRequired={false}
          value={proposalMetadata.description}
          onChange={e => setFieldValue('proposalMetadata.description', e.target.value)}
          disabled={false}
          placeholder={t('proposalDescriptionPlaceholder')}
          rows={3}
        />
        <InputComponent
          label={t('proposalAdditionalResources')}
          helper={t('proposalAdditionalResourcesHelper')}
          isRequired={false}
          onChange={e => setFieldValue('proposalMetadata.documentationUrl', e.target.value)}
          value={proposalMetadata.documentationUrl}
          disabled={false}
          placeholder={t('proposalAdditionalResourcesPlaceholder')}
          errorMessage={
            proposalMetadata.documentationUrl && proposalMetadataError?.documentationUrl
          }
          testId="metadata.documentationUrl"
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
        disabled={!!proposalMetadataError}
      >
        Next
      </Button>
    </>
  );
}

export default UsulMetadata;
