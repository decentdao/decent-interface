import { useEffect, useState } from "react";
import Button from "../../../../ui/Button";
import { BigNumber, ethers } from "ethers";
import useCreateProposal from "../../../../../daoData/useCreateProposal";
import ConnectModal from "../../../../ConnectModal";
import Pending from "../../../../Pending";
import Essentials from "./Essentials";
import Transactions from "./Transactions";

export type TransactionData = {
  targetAddress: string;
  functionName: string;
  functionSignature: string;
  parameters: string;
};

export type ProposalData = {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
  description: string;
};

const New = ({ address }: { address: string | undefined }) => {
  const [step, setStep] = useState<number>(0);
  const [proposalDescription, setProposalDescription] = useState<string>("");
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
            <Button
              onClick={addTransaction}
              disabled={false}
              addedClassNames="px-8 py-2 mx-2 border-gold-300 bg-chocolate-500 text-gold-300"
            >
              Add Transaction
            </Button>
          </div>
        )}
        <div className="flex items-center justify-center mt-4 space-x-4">
          {step === 1 && (
            <Button
              onClick={decrementStep}
              disabled={false}
              addedClassNames="px-8 py-2 mx-2 border-gold-300 bg-chocolate-500 text-gold-300"
            >
              Back
            </Button>
          )}
          {step === 1 && (
            <Button
              onClick={createProposal}
              disabled={false}
              addedClassNames="px-8 py-2 mx-2 border-gold-300 bg-chocolate-500 text-gold-300"
            >
              Create Proposal
            </Button>
          )}
          {step === 0 && (
            <Button
              onClick={incrementStep}
              disabled={false}
              addedClassNames="px-8 py-2 mx-2 border-gold-300 bg-chocolate-500 text-gold-300"
            >
              Next: Add Transactions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default New;
