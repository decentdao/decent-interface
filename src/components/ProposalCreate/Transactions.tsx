import {
  Box,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  HStack,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { ArrowDown, ArrowRight } from '@decent-org/fractal-ui';
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

  //TODO: placeholder for delete icon, remove when added to decent-ui
  function DeleteIcon() {
    return (
      <Icon
        viewBox="0 0 16 18"
        _hover={{ fill: 'gold.500-hover' }}
        fill="grayscale.100"
      >
        <path
          xmlns="http://www.w3.org/2000/svg"
          d="M5 0V1H0V3H1V16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H13C13.5304 18 14.0391 17.7893 14.4142 17.4142C14.7893 17.0391 15 16.5304 15 16V3H16V1H11V0H5ZM3 3H13V16H3V3ZM5 5V14H7V5H5ZM9 5V14H11V5H9Z"
        />
      </Icon>
    );
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
            <Box
              rounded="lg"
              p="1rem"
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
                    icon={<DeleteIcon />}
                    aria-label={t('removetransactionlabel')}
                    variant="unstyled"
                    onClick={() => removeTransaction(index)}
                    minWidth="auto"
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
