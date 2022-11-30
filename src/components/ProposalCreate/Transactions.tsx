import {
  Box,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
} from '@chakra-ui/react';
import { ArrowDown, ArrowRight } from '@decent-org/fractal-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { encodeMultiSend } from '../../helpers';
import { TransactionData } from '../../types/transaction';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import Transaction from './Transaction';

interface TransactionsProps {
  transactions: TransactionData[];
  pending: boolean;
  setTransactions: React.Dispatch<React.SetStateAction<TransactionData[]>>;
  removeTransaction: (transactionNumber: number) => void;
  //  expandedTransactions: number[];
}

function Transactions({
  transactions,
  pending,
  setTransactions,
  removeTransaction,
}: //  expandedTransactions,
TransactionsProps) {
  const updateTransaction = (transactionData: TransactionData, transactionNumber: number) => {
    const transactionsArr = [...transactions];
    transactionsArr[transactionNumber] = { ...transactionData };
    setTransactions(transactionsArr);
  };

  const { t } = useTranslation(['proposal', 'common']);

  function toggleExpanded(transactionNumber: number) {
    const newTransactionData = Object.assign({}, transactions[transactionNumber]);
    newTransactionData.isExpanded = !transactions[transactionNumber].isExpanded;
    updateTransaction(newTransactionData, transactionNumber);
  }

  return (
    <Accordion
      allowToggle
      allowMultiple
      index={transactions.map((tr, index) => (tr.isExpanded ? index : -1))}
    >
      {transactions.map((transaction, index) => (
        <AccordionItem
          key={index}
          borderTop="none"
          borderBottom="none"
        >
          {({ isExpanded }) => (
            <ContentBox>
              <HStack justify="space-between">
                <AccordionButton onClick={() => toggleExpanded(index)}>
                  {isExpanded ? <ArrowDown boxSize="1.5rem" /> : <ArrowRight fontSize="1.5rem" />}
                  <Box
                    flex="1"
                    textAlign="left"
                  >
                    Transaction {index + 1}
                  </Box>
                </AccordionButton>
                {index !== 0 && (
                  <Button
                    variant="text"
                    minWidth="0px"
                    onClick={() => removeTransaction(index)}
                    disabled={pending && transaction.targetAddress.trim().length > 0}
                    pr={0}
                  >
                    {t('labelRemoveTransaction')}
                  </Button>
                )}
              </HStack>
              <AccordionPanel>
                <Transaction
                  transaction={transaction}
                  transactionNumber={index}
                  updateTransaction={updateTransaction}
                  removeTransaction={removeTransaction}
                  transactionCount={transactions.length}
                  pending={pending}
                />
              </AccordionPanel>
            </ContentBox>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default Transactions;

{
  /* <ContentBox>
<ContentBoxTitle>Transaction {transactionCount}</ContentBoxTitle>
{transactionCount > 1 && (
  <Button
    variant="text"
    minWidth="0px"
    onClick={() => removeTransaction(transactionNumber)}
    disabled={
      pending &&
      transaction.targetAddress.trim().length > 0 &&
      validateFunctionData(
        transaction.functionName,
        transaction.functionSignature,
        transaction.parameters
      )
    }
  >
    {t('labelRemoveTransaction')}
  </Button> */
}
