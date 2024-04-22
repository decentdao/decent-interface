import { Flex, Button } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateProposalState } from '../../types';
import { CreateProposalForm, ProposalBuilderMode } from '../../types/proposalBuilder';

interface StateButtonsProps extends FormikProps<CreateProposalForm> {
  pendingTransaction: boolean;
  formState: CreateProposalState;
  setFormState: Dispatch<SetStateAction<CreateProposalState>>;
  canUserCreateProposal?: boolean;
  safeNonce?: number;
  mode: ProposalBuilderMode;
}

export default function StateButtons(props: StateButtonsProps) {
  const {
    pendingTransaction,
    formState,
    setFormState,
    errors: {
      transactions: transactionsError,
      nonce: nonceError,
      proposalMetadata: proposalMetadataError,
    },
    canUserCreateProposal,
    values: { proposalMetadata },
  } = props;
  const { t } = useTranslation(['common', 'proposal']);
  if (formState === CreateProposalState.METADATA_FORM) {
    return (
      <Button
        w="100%"
        onClick={() => setFormState(CreateProposalState.TRANSACTIONS_FORM)}
        isDisabled={!!proposalMetadataError || !proposalMetadata.title}
      >
        {t('next', { ns: 'common' })}
      </Button>
    );
  }
  return (
    <Flex>
      <Button
        variant="text"
        textStyle="text-md-mono-regular"
        color="gold.500"
        cursor="pointer"
        onClick={() => setFormState(CreateProposalState.METADATA_FORM)}
        mb={4}
      >
        {t('back', { ns: 'common' })}
      </Button>

      <Button
        w="100%"
        type="submit"
        isDisabled={
          !canUserCreateProposal || !!transactionsError || !!nonceError || pendingTransaction
        }
      >
        {t('createProposal', { ns: 'proposal' })}
      </Button>
    </Flex>
  );
}
