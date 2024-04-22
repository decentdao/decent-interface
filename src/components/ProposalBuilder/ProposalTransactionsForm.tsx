import { Button, Box, Text, VStack, Alert, AlertTitle } from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { FormikProps } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateProposalForm, ProposalBuilderMode } from '../../types/proposalBuilder';
import { scrollToBottom } from '../../utils/ui';
import ProposalTransactions from './ProposalTransactions';
import { DEFAULT_PROPOSAL_TRANSACTION } from './constants';

interface ProposalTransactionsFormProps extends FormikProps<CreateProposalForm> {
  pendingTransaction: boolean;
  safeNonce?: number;
  mode: ProposalBuilderMode;
}

export default function ProposalTransactionsForm(props: ProposalTransactionsFormProps) {
  const {
    pendingTransaction,
    setFieldValue,
    values: { transactions },
    safeNonce,
  } = props;
  const { t } = useTranslation(['proposalTemplate', 'proposal', 'common']);
  const [expandedIndecies, setExpandedIndecies] = useState<number[]>([0]);

  useEffect(() => {
    if (safeNonce) {
      setFieldValue('nonce', safeNonce);
    }
  }, [safeNonce, setFieldValue]);

  return (
    <Box>
      <ProposalTransactions
        expandedIndecies={expandedIndecies}
        setExpandedIndecies={setExpandedIndecies}
        {...props}
      />
      <VStack
        align="left"
        spacing={6}
        pt={2}
      >
        <Button
          variant="text"
          onClick={() => {
            setFieldValue('transactions', [...transactions, DEFAULT_PROPOSAL_TRANSACTION]);
            setExpandedIndecies([transactions.length]);
            scrollToBottom();
          }}
          disabled={pendingTransaction}
          w="fit-content"
          pl={0}
        >
          {t('labelAddTransaction', { ns: 'proposal' })}
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
              {t('transactionExecutionAlertMessage', { ns: 'proposal' })}
            </Text>
          </AlertTitle>
        </Alert>
      </VStack>
    </Box>
  );
}
