import {
  Box,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { ArrowDown, ArrowRight, Trash } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { TransactionData } from '../../types/transaction';
import Transaction from './Transaction';

interface TransactionsProps {
  transactions: TransactionData[];
  pending: boolean;
  setTransactions: React.Dispatch<React.SetStateAction<TransactionData[]>>;
  removeTransaction: (transactionNumber: number) => void;
}

function Transactions({
  transactions,
  pending,
  setTransactions,
  removeTransaction,
}: TransactionsProps) {
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
            <Box
              rounded="lg"
              p={3}
              my="2"
              bg="black.900"
            >
              <HStack justify="space-between">
                <AccordionButton
                  onClick={() => toggleExpanded(index)}
                  p={0}
                  textStyle="text-button-md-semibold"
                  color="grayscale.100"
                >
                  {isExpanded ? <ArrowDown boxSize="1.5rem" /> : <ArrowRight fontSize="1.5rem" />}
                  {t('transaction')} {index + 1}
                </AccordionButton>
                {index !== 0 ? (
                  <IconButton
                    icon={<Trash boxSize="24px" />}
                    aria-label={t('removetransactionlabel')}
                    variant="unstyled"
                    onClick={() => removeTransaction(index)}
                    minWidth="auto"
                    _hover={{ color: 'gold.500' }}
                  />
                ) : (
                  <Box h="36px" />
                )}
              </HStack>
              <AccordionPanel p={0}>
                <Transaction
                  transaction={transaction}
                  transactionNumber={index}
                  updateTransaction={updateTransaction}
                  pending={pending}
                />
              </AccordionPanel>
            </Box>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default Transactions;
