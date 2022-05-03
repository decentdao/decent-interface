import { TransactionData } from "./index";
import Transaction from "./Transaction";

interface TransactionsProps {
  transactions: TransactionData[];
  errorMap: Map<number, { address: string | null; fragment: string | null }>
  setError: (key: number, errorType: 'address' | 'fragment', error: string | null) => void;
  removeError: (key: number) => void;
  setTransactions: React.Dispatch<React.SetStateAction<TransactionData[]>>;
  removeTransaction: (transactionNumber: number) => void;
}

const Transactions = ({ transactions, errorMap, setError, setTransactions, removeTransaction }: TransactionsProps) => {

  const updateTransaction = (transactionData: TransactionData, transactionNumber: number) => {
    const newTransactions: TransactionData[] = transactions.map((transaction) => transaction);
    newTransactions[transactionNumber] = transactionData;
    setTransactions(newTransactions);
  };

  return (
    <div>
      {transactions.map((transaction, index) => (
        <Transaction
          key={index}
          setError={setError}
          errorMap={errorMap}
          transaction={transaction}
          transactionNumber={index}
          updateTransaction={updateTransaction}
          removeTransaction={removeTransaction}
          transactionCount={transactions.length}
        />
      ))}
    </div>
  );
};

export default Transactions;
