import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import useCreateProposal from "../../../../../daoData/useCreateProposal";
import ConnectModal from "../../../../ConnectModal";
import Pending from "../../../../Pending";
import Essentials from "./Essentials";
import Transactions from "./Transactions";
import ContentBox from "../../../../ui/ContentBox";
import H1 from "../../../../ui/H1";
import { PrimaryButton, SecondaryButton, TextButton } from "../../../../ui/forms/Button";
import LeftArrow from "../../../../ui/svg/LeftArrow";

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
    setTransactions([...transactions.slice(0, transactionNumber), ...transactions.slice(transactionNumber + 1)]);
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
          new ethers.utils.Interface([transaction.functionSignature]).encodeFunctionData(transaction.functionName, JSON.parse(transaction.parameters))
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
      <div>
        <H1>Create Proposal</H1>
        <form onSubmit={(e) => e.preventDefault()}>
          {step === 0 && <Essentials proposalDescription={proposalDescription} setProposalDescription={setProposalDescription} />}
          {step === 1 && <Transactions transactions={transactions} setTransactions={setTransactions} removeTransaction={removeTransaction} />}
        </form>
        {step === 1 && (
          <div className="flex items-center justify-center border-b border-gray-300 py-4 mb-8">
            <TextButton onClick={addTransaction} disabled={false} label="+ Add another transaction" />
          </div>
        )}
        <div className="flex items-center justify-center mt-4 space-x-4">
          {step === 1 && <TextButton onClick={decrementStep} disabled={false} icon={<LeftArrow />} label="Prev" />}
          {step === 1 && <PrimaryButton onClick={createProposal} disabled={false} label="Create Proposal" isLarge/>}
          {step === 0 && <SecondaryButton onClick={incrementStep} disabled={false} label="Next: Add Transactions" />}
        </div>
      </div>
    </div>
  );
};

export default New;
