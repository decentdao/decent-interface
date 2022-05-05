import { useCallback, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import useCreateProposal from "../../../../../daoData/useCreateProposal";
import Essentials from "./Essentials";
import Transactions from "./Transactions";
import H1 from "../../../../ui/H1";
import { PrimaryButton, SecondaryButton, TextButton } from "../../../../ui/forms/Button";
import LeftArrow from "../../../../ui/svg/LeftArrow";
import { useDAOData } from "../../../../../daoData";

export type TransactionData = {
  targetAddress: string;
  functionName: string;
  functionSignature: string;
  parameters: string;
  addressError?: string;
  fragmentError?: string;
};

export type ProposalData = {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
  description: string;
};

const defaultTransaction = {
  targetAddress: "",
  functionName: "",
  functionSignature: "",
  parameters: "",
};

const New = () => {
  const [{ daoAddress }] = useDAOData();
  const [step, setStep] = useState<number>(0);
  const [proposalDescription, setProposalDescription] = useState<string>("");
  const [transactions, setTransactions] = useState<TransactionData[]>([defaultTransaction]);
  const [pending, setPending] = useState<boolean>(false);
  const [proposalData, setProposalData] = useState<ProposalData>();

  /**
   * adds new transaction form
   */
  const addTransaction = () => {
    setTransactions([...transactions, defaultTransaction]);
  };

  const removeTransaction = (transactionNumber: number) => {
    const _transactions = transactions.filter((_, i) => i !== transactionNumber);
    setTransactions(_transactions);
  };

  const decrementStep = () => {
    setStep((currentStep) => currentStep - 1);
  };

  const incrementStep = () => {
    setStep((currentStep) => currentStep + 1);
  };

  const clearState = () => {
    setProposalDescription("");
    setTransactions([]);
    setProposalData(undefined)
  }

  /**
   * adds new error to mapping
   * @param key
   * @param error
   */
  const setError = useCallback(
    (key: number, errorType: "address" | "fragment", error: string | null) => {
      const errors = new Map(errorMap);
      const currentTransactionErrors = errors.get(key);
      const prevAddress = currentTransactionErrors?.address || null;
      const prevFragment = currentTransactionErrors?.fragment || null;

      const currentErrors = {
        address: errorType === "address" ? error : prevAddress,
        fragment: errorType === "fragment" ? error : prevFragment,
      };
      errors.set(key, currentErrors);
      setErrorMap(errors);
    },
    [errorMap]
  );

  /**
   * removes error to mapping
   * @param key
   * @param error
   */
  const removeError = (key: number) => {
    const errors = new Map(errorMap);
    errors.delete(key);
    setErrorMap(errors);
  };

  useEffect(() => {
    try {
      let hasError: boolean = false;
      transactions.forEach((transaction: TransactionData) => {
        if (transaction.addressError || transaction.fragmentError) {
          hasError = true;
        }
      });
      if (hasError) {
        return;
      }
      const proposal = {
        targets: transactions.map((transaction) => transaction.targetAddress),
        values: transactions.map(() => BigNumber.from("0")),
        calldatas: transactions.map((transaction) => {
          const _functionSignature = `function ${transaction.functionName}(${transaction.functionSignature})`;
          const _parameters = `[${transaction.parameters}]`;
          return new ethers.utils.Interface([_functionSignature]).encodeFunctionData(transaction.functionName, JSON.parse(_parameters));
        }),
        description: proposalDescription,
      };
      setProposalData(proposal);
    } catch {
      // catches errors related to `ethers.utils.Interface` and the `encodeFunctionData` these errors are handled in the onChange of the inputs
      // these errors are handled in the onChange of the inputs in transactions
    }
  }, [transactions, proposalDescription]);

  const createProposal = useCreateProposal({
    daoAddress,
    proposalData,
    setPending,
    clearState,
  });

  const isValidProposalValid = useCallback(() => {
    // if proposalData doesn't exist
    if (!proposalData) {
      return false;
    }
    // if error in transactions
    let hasError: boolean = false;
    transactions.forEach((transaction: TransactionData) => {
      if (transaction.addressError || transaction.fragmentError) {
        hasError = true;
      }
    });
    if (hasError) {
      return false;
    }
    // proposal data has length of 1 for each data set
    let hasProposalData: boolean = !!proposalData.calldatas.length && !!proposalData.targets.length;
    if (!hasProposalData) {
      return false;
    }
    // validations pass
    return true;
  }, [proposalData, transactions]);

  return (
    <div>
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
          {step === 1 && <TextButton type="button" onClick={decrementStep} disabled={false} icon={<LeftArrow />} label="Prev" />}
          {step === 1 && <PrimaryButton type="button" onClick={createProposal} disabled={!isValidProposalValid() || pending} label="Create Proposal" isLarge />}
          {step === 0 && <SecondaryButton type="button" onClick={incrementStep} disabled={!proposalDescription.trim().length} label="Next: Add Transactions" />}
        </div>
      </div>
    </div>
  );
};

export default New;
