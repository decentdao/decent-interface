import { TransactionData } from "./index";
import Transaction from "./Transaction";

const Transactions = ({
  transactions,
  setTransactions,
  removeTransaction,
}: {
  transactions: TransactionData[];
  setTransactions: React.Dispatch<React.SetStateAction<TransactionData[]>>;
  removeTransaction: (transactionNumber: number) => void;
}) => {
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
