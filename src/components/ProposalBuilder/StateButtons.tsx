import { Flex, Button, Icon } from '@chakra-ui/react';
import { CaretRight, CaretLeft } from '@phosphor-icons/react';
import { FormikProps } from 'formik';
import { Dispatch, ReactNode, SetStateAction } from 'react';
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

function StateButtonsContainer({ children }: { children: ReactNode }) {
  return (
    <Flex
      mt="1.5rem"
      gap="0.75rem"
      alignItems="center"
      justifyContent="flex-end"
      width="100%"
    >
      {children}
    </Flex>
  );
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
      <StateButtonsContainer>
        <Button
          onClick={() => setFormState(CreateProposalState.TRANSACTIONS_FORM)}
          isDisabled={!!proposalMetadataError || !proposalMetadata.title}
          px="2rem"
        >
          {t('next', { ns: 'common' })}
          <CaretRight />
        </Button>
      </StateButtonsContainer>
    );
  }
  return (
    <StateButtonsContainer>
      <Button
        px="2rem"
        variant="text"
        color="lilac-0"
        onClick={() => setFormState(CreateProposalState.METADATA_FORM)}
      >
        <Icon
          bg="transparent"
          aria-label="Back"
          as={CaretLeft}
          color="lilac-0"
        />
        {t('back', { ns: 'common' })}
      </Button>
      <Button
        px="2rem"
        type="submit"
        isDisabled={
          !canUserCreateProposal || !!transactionsError || !!nonceError || pendingTransaction
        }
      >
        {t('createProposal', { ns: 'proposal' })}
      </Button>
    </StateButtonsContainer>
  );
}
