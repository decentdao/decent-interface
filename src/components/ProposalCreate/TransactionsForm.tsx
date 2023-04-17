import { Button, Box, Flex, Text, VStack, Divider, Alert, AlertTitle } from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CreateProposalForm, CreateProposalState } from '../../types';
import Transactions from './Transactions';
import { DEFAULT_TRANSACTION } from './constants';

interface TransactionsFormProps extends FormikProps<CreateProposalForm> {
  isVisible: boolean;
  showBackButton: boolean;
  pendingTransaction: boolean;
  setFormState: (state: CreateProposalState) => void;
  canUserCreateProposal: boolean;
}

function TransactionsForm(props: TransactionsFormProps) {
  const {
    isVisible,
    showBackButton,
    pendingTransaction,
    setFormState,
    setFieldValue,
    values: { transactions },
    errors: { transactions: transactionsError },
    canUserCreateProposal,
  } = props;
  const { t } = useTranslation(['proposal', 'common']);

  if (!isVisible) return null;

  return (
    <Box>
      <Transactions {...props} />
      <VStack
        align="left"
        spacing={6}
        pt={2}
      >
        <Button
          variant="text"
          onClick={() => setFieldValue('transactions', [...transactions, DEFAULT_TRANSACTION])}
          isDisabled={pendingTransaction}
          w="fit-content"
          pl={0}
        >
          {t('labelAddTransaction')}
        </Button>
        <Alert
          status="info"
          w="fit-full"
        >
          <Info boxSize="1.5rem" />
          <AlertTitle>
            <Text
              textStyle="text-lg-mono-medium"
              whiteSpace="pre-wrap"
            >
              {t('transactionExecutionAlertMessage')}
            </Text>
          </AlertTitle>
        </Alert>
        <Divider color="chocolate.700" />
        <Flex>
          {showBackButton && (
            <Button
              variant="text"
              textStyle="text-md-mono-regular"
              color="gold.500"
              cursor="pointer"
              onClick={() => setFormState(CreateProposalState.METADATA_FORM)}
              mb={4}
            >
              {`< ${t('proposalBack')}`}
            </Button>
          )}
          <Button
            w="100%"
            type="submit"
            isDisabled={!canUserCreateProposal || !!transactionsError || pendingTransaction}
          >
            {t('createProposal')}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}

export default TransactionsForm;
