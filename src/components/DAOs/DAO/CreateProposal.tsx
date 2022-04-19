import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import CreateDAOInput from "../../ui/CreateDAOInput";
import { BigNumber, ethers } from "ethers";
import useCreateProposal from "../../../daoData/useCreateProposal";
import ConnectModal from '../../ConnectModal';
import Pending from '../../Pending';

type TransactionData = {
  targetAddress: string;
  functionName: string;
  functionSignature: string;
  parameters: string;
};

type ProposalData = {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
  description: string;
};

const Transaction = ({
  transaction,
  transactionNumber,
  updateTransaction,
  removeTransaction,
  transactionCount,
}: {
  transaction: TransactionData;
  transactionNumber: number;
  updateTransaction: (
    transactionData: TransactionData,
    transactionNumber: number
  ) => void;
  removeTransaction: (transactionNumber: number) => void;
  transactionCount: number;
}) => {
  const updateTargetAddress = (targetAddress: string) => {
    const newTransactionData = {
      targetAddress: targetAddress,
      functionName: transaction.functionName,
      functionSignature: transaction.functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionName = (functionName: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionName: functionName,
      functionSignature: transaction.functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionName: transaction.functionName,
      functionSignature: functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateParameters = (parameters: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionName: transaction.functionName,
      functionSignature: transaction.functionSignature,
      parameters: parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  return (
    <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
      <div className="flex flex-row">
        <div className="flex flex-grow pb-8 text-lg">Transaction</div>
        {transactionCount > 1 && (
          <div
            className="flex pb-8 text-sm cursor-pointer"
            onClick={() => removeTransaction(transactionNumber)}
          >
            Remove Transaction
          </div>
        )}
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
        value={transaction.functionName}
        onChange={(e) => updateFunctionName(e)}
        label="Function Name"
        helperText="The name of the function to be called if this proposal passes"
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
  removeTransaction,
}: {
  transactions: TransactionData[];
  setTransactions: React.Dispatch<React.SetStateAction<TransactionData[]>>;
  removeTransaction: (transactionNumber: number) => void;
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
          transactionCount={transactions.length}
        />
      ))}
    </div>
  );
};

const Essentials = ({
  proposalDescription,
  setProposalDescription,
}: {
  proposalDescription: string;
  setProposalDescription: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
      <div className="pb-8 text-lg">Essentials</div>
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

const CreateProposal = ({ address }: { address: string | undefined }) => {
  const [step, setStep] = useState(0);
  const [proposalDescription, setProposalDescription] = useState("");
  const [transactions, setTransactions] = useState<TransactionData[]>([
    {
      targetAddress: "",
      functionName: "",
      functionSignature: "",
      parameters: "",
    },
  ]);
  const [pending, setPending] = useState<boolean>(false);
  const [proposalData, setProposalData] = useState<ProposalData>();

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      {
        targetAddress: "",
        functionName: "",
        functionSignature: "",
        parameters: "",
      },
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

  useEffect(() => {
    try {
      setProposalData({
        targets: transactions.map((transaction) => transaction.targetAddress),
        values: transactions.map(() => BigNumber.from("0")),
        calldatas: transactions.map((transaction) =>
          new ethers.utils.Interface([
            transaction.functionSignature,
          ]).encodeFunctionData(
            transaction.functionName,
            JSON.parse(transaction.parameters)
          )
        ),
        description: proposalDescription,
      });
    } catch {}
  }, [transactions, proposalDescription]);

  const createProposal = useCreateProposal({
    daoAddress: address,
    proposalData,
    setPending,
  });

  return (
    <div>
      <Pending message="Creating Proposal..." pending={pending} />
      <ConnectModal />
      <div className="mx-24">
        <div className="mt-24 text-xl">Create Proposal</div>

        <div className="flex">
          {step === 0 && (
            <Essentials
              proposalDescription={proposalDescription}
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
          <div className="flex items-center justify-center">
            <Button onClick={addTransaction} disabled={false}>
              Add Transaction
            </Button>
          </div>
        )}
        <div className="flex items-center justify-center mt-4 space-x-4">
          {step === 1 && (
            <Button onClick={decrementStep} disabled={false}>
              Back
            </Button>
          )}
          {step === 1 && (
            <Button onClick={createProposal} disabled={false}>
              Create Proposal
            </Button>
          )}
          {step === 0 && (
            <Button onClick={incrementStep} disabled={false}>
              Next: Add Transactions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
