import { Button, Box, Icon } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { FormikProps } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateProposalForm, ProposalBuilderMode } from '../../types/proposalBuilder';
import { scrollToBottom } from '../../utils/ui';
import Divider from '../ui/utils/Divider';
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
      <Divider my="1.5rem" />
      <Button
        variant="text"
        onClick={() => {
          setFieldValue('transactions', [...transactions, DEFAULT_PROPOSAL_TRANSACTION]);
          setExpandedIndecies([transactions.length]);
          scrollToBottom();
        }}
        disabled={pendingTransaction}
        w="fit-content"
        color="celery-0"
        padding="0.25rem 0.75rem"
        gap="0.25rem"
        borderRadius="625rem"
        borderColor="transparent"
        borderWidth="1px"
        _hover={{ bg: 'celery--6', borderColor: 'celery--6' }}
        _active={{ bg: 'celery--6', borderWidth: '1px', borderColor: 'celery--5' }}
      >
        <Icon as={Plus} />
        {t('labelAddTransaction', { ns: 'proposal' })}
      </Button>
    </Box>
  );
}
