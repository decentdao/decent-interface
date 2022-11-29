import { Box } from '@chakra-ui/react';
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

  return (
    <Box>
      {transactions.map((transaction, index) => (
        <Transaction
          key={index}
          transaction={transaction}
          transactionNumber={index}
          updateTransaction={updateTransaction}
          removeTransaction={removeTransaction}
          transactionCount={transactions.length}
          pending={pending}
        />
      ))}
    </Box>
  );
}

export default Transactions;
