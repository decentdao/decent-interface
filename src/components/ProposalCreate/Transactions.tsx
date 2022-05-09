import { TransactionData } from "../../types/transaction";
import Transaction from "./Transaction";

interface TransactionsProps {
  transactions: TransactionData[];
  pending: boolean;
  setTransactions: React.Dispatch<React.SetStateAction<TransactionData[]>>;
  removeTransaction: (transactionNumber: number) => void;
}

const Transactions = ({ transactions, pending, setTransactions, removeTransaction }: TransactionsProps) => {
  const updateTransaction = (transactionData: TransactionData, transactionNumber: number) => {
    const _transactions = [...transactions]
      _transactions[transactionNumber] = {...transactionData} 
    setTransactions(_transactions);
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
          pending={pending}
        />
      ))}
    </div>
  );
};

export default Transactions;
