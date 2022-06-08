import { useCallback, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import Essentials from '../../components/ProposalCreate/Essentials';
import Transactions from '../../components/ProposalCreate/Transactions';
import { TextButton, PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';
import LeftArrow from '../../components/ui/svg/LeftArrow';
import { useDAOData } from '../../contexts/daoData';
import useCreateProposal from '../../hooks/useCreateProposal';
import { TransactionData } from '../../types/transaction';
import { ProposalData } from '../../types/proposal';

const defaultTransaction = {
  targetAddress: '',
  functionName: '',
  functionSignature: '',
  parameters: '',
};

function ProposalCreate() {
  const [{ daoAddress }] = useDAOData();
  const [step, setStep] = useState<number>(0);
  const [proposalDescription, setProposalDescription] = useState<string>('');
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
    const filteredTransactions = transactions.filter((_, i) => i !== transactionNumber);
    setTransactions(filteredTransactions);
  };

  const decrementStep = () => {
    setStep(currentStep => currentStep - 1);
  };

  const incrementStep = () => {
    setStep(currentStep => currentStep + 1);
  };

  const clearState = () => {
    setProposalDescription('');
    setTransactions([]);
    setProposalData(undefined);
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
        targets: transactions.map(transaction => transaction.targetAddress),
        values: transactions.map(() => BigNumber.from('0')),
        calldatas: transactions.map(transaction => {
          const funcSignature = `function ${transaction.functionName}(${transaction.functionSignature})`;
          const parametersArr = `[${transaction.parameters}]`;
          return new ethers.utils.Interface([funcSignature]).encodeFunctionData(
            transaction.functionName,
            JSON.parse(parametersArr)
          );
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
        <form onSubmit={e => e.preventDefault()}>
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
              pending={pending}
            />
          )}
        </form>
        {step === 1 && (
          <div className="flex items-center justify-center border-b border-gray-300 py-4 mb-8">
            <TextButton
              onClick={addTransaction}
              disabled={pending}
              label="+ Add another transaction"
            />
          </div>
        )}
        <div className="flex items-center justify-center mt-4 space-x-4">
          {step === 1 && (
            <TextButton
              type="button"
              onClick={decrementStep}
              disabled={pending}
              icon={<LeftArrow />}
              label="Prev"
            />
          )}
          {step === 1 && (
            <PrimaryButton
              type="button"
              onClick={createProposal}
              disabled={!isValidProposalValid() || pending}
              label="Create Proposal"
              isLarge
            />
          )}
          {step === 0 && (
            <SecondaryButton
              type="button"
              onClick={incrementStep}
              disabled={!proposalDescription.trim().length}
              label="Next: Add Transactions"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProposalCreate;
