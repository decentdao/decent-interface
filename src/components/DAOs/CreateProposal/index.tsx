import { useState } from "react";
import Button from "../../ui/Button";
import CreateDAOInput from "../../ui/CreateDAOInput";

type TransactionData = {
  targetAddress: string;
  functionSignature: string;
  parameters: string;
};

const Transaction = ({
  transaction,
  transactionNumber,
  updateTransaction,
  removeTransaction
}: {
  transaction: TransactionData;
  transactionNumber: number;
  updateTransaction: (
    transactionData: TransactionData,
    transactionNumber: number,
  ) => void,
  removeTransaction: (transactionNumber: number) => void
}) => {
  const updateTargetAddress = (targetAddress: string) => {
    const newTransactionData = {
      targetAddress: targetAddress,
      functionSignature: transaction.functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionSignature: functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateParameters = (parameters: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionSignature: transaction.functionSignature,
      parameters: parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  return (
    <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
      <div className="flex flex-row">
        <div className="flex pb-8 text-lg">Transaction</div>
        <div className="flex pb-8 text-sm cursor-pointer" onClick={() => removeTransaction(transactionNumber)}>
          Remove Transaction
        </div>
      </div>
      <CreateDAOInput
        dataType="text"
        value={transaction.targetAddress}
        onChange={(e) => updateTargetAddress(e)}
        label="Target Address"
        helperText="The smart contract address this proposal will modify"
        disabled={false}
      />
      <CreateDAOInput
        dataType="text"
        value={transaction.functionSignature}
        onChange={(e) => updateFunctionSignature(e)}
        label="Function Signature"
        helperText="The function of the smart contract (above) to be called if this proposal passes"
        disabled={false}
      />
      <CreateDAOInput
        dataType="text"
        value={transaction.parameters}
        onChange={(e) => updateParameters(e)}
        label="Parameters"
        helperText="Values used to call the function (comma separated)"
        disabled={false}
      />
    </div>
  );
};

const Transactions = ({
  transactions,
  setTransactions,
  removeTransaction
}: {
  transactions: TransactionData[],
  setTransactions: React.Dispatch<React.SetStateAction<TransactionData[]>>,
  removeTransaction: (transactionNumber: number) => void
}) => {
  const updateTransaction = (
    transactionData: TransactionData,
    transactionNumber: number
  ) => {
    const newTransactions: TransactionData[] = transactions.map(
      (transaction) => transaction
    );
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
        />
      ))}
    </div>
  );
};

const Essentials = ({
  proposalTitle,
  proposalDescription,
  setProposalTitle,
  setProposalDescription,
}: {
  proposalTitle: string;
  proposalDescription: string;
  setProposalTitle: React.Dispatch<React.SetStateAction<string>>;
  setProposalDescription: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
      <div className="pb-8 text-lg">Essentials</div>
      <CreateDAOInput
        dataType="text"
        value={proposalTitle}
        onChange={(e) => setProposalTitle(e)}
        label="Proposal Title"
        helperText="What's this proposal called? Good titles are brief yet descriptive"
        disabled={false}
      />
      <CreateDAOInput
        dataType="text"
        value={proposalDescription}
        onChange={(e) => setProposalDescription(e)}
        label="Proposal Description"
        helperText="What's the goal of this proposal? Explain the desired outcome and why it matters"
        disabled={false}
      />
    </div>
  );
};

const CreateProposal = ({ address }: { address: string }) => {
  const [step, setStep] = useState(0);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [transactions, setTransactions] = useState<TransactionData[]>([
    {
      targetAddress: "",
      functionSignature: "",
      parameters: "",
    },
  ]);

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      { targetAddress: "", functionSignature: "", parameters: "" },
    ]);
  };

  const removeTransaction = (transactionNumber: number) => {
    setTransactions([
      ...transactions.slice(0, transactionNumber),
      ...transactions.slice(transactionNumber + 1),
    ]);
  };

  const decrementStep = () => {
    setStep((currentStep) => currentStep - 1);
  };

  const incrementStep = () => {
    setStep((currentStep) => currentStep + 1);
  };

  return (
    <div className="mx-24">
      <div className="mt-24 text-xl">Create Proposal</div>

      <div>
        {step === 0 && (
          <Essentials
            proposalTitle={proposalTitle}
            proposalDescription={proposalDescription}
            setProposalTitle={setProposalTitle}
            setProposalDescription={setProposalDescription}
          />
        )}
        {step === 1 && (
          <Transactions
            transactions={transactions}
            setTransactions={setTransactions}
            removeTransaction={removeTransaction}
          />
        )}
      </div>

      {step === 1 && (
        <div>
          <Button onClick={addTransaction} disabled={false}>
            Add Transaction
          </Button>
        </div>
      )}
      <div>
        {step === 1 && (
          <Button onClick={decrementStep} disabled={false}>
            Back
          </Button>
        )}
        {step === 0 && (
          <Button onClick={incrementStep} disabled={false}>
            Next: Add Transactions
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateProposal;
