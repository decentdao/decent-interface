import { ReactText, useEffect, useMemo, useRef, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import Essentials from '../../components/ProposalCreate/Essentials';
import Transactions from '../../components/ProposalCreate/Transactions';
import { TextButton, PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';
import LeftArrow from '../../components/ui/svg/LeftArrow';
import { TransactionData } from '../../types/transaction';
import { ProposalExecuteData } from '../../types/proposal';
import { useNavigate } from 'react-router-dom';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import { toast } from 'react-toastify';

const defaultTransaction = {
  targetAddress: '',
  functionName: '',
  functionSignature: '',
  parameters: '',
};

function ProposalCreate() {
  const {
    dao: { daoAddress },
    modules: { tokenVotingGovernanceModule },
  } = useFractal();

  const {
    createProposal: { submitProposal, pendingCreateTx },
    votingToken: {
      votingTokenData: { votingWeight, proposalTokenThreshold },
    },
  } = useGovenorModule();
  const [step, setStep] = useState<number>(0);
  const [proposalDescription, setProposalDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionData[]>([defaultTransaction]);
  const [proposalData, setProposalData] = useState<ProposalExecuteData>();
  const navigate = useNavigate();
  const thresholdToastId = useRef<ReactText>('');
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

  const successCallback = () => {
    setProposalDescription('');
    setTransactions([]);
    setProposalData(undefined);

    navigate(`/daos/${daoAddress}/modules/${tokenVotingGovernanceModule!.moduleAddress}`);
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
      // catches errors related to `ethers.utils.Interface` and the `encodeFunctionData`
      // these errors are handled in the onChange of the inputs in transactions
    }
  }, [transactions, proposalDescription]);

  const canUserCreateProposal = useMemo(() => {
    // disable while threshold and voting weight are loading
    if (votingWeight === undefined || proposalTokenThreshold === undefined) {
      return false;
    }
    // disable if the user's voting veight is 0
    if (votingWeight.isZero()) {
      if (!thresholdToastId.current) {
        thresholdToastId.current = toast('Only delegatees can create proposals', {
          autoClose: false,
          progress: 1,
        });
      }
      return false;
    } else {
      toast.dismiss(thresholdToastId.current);
    }

    // disable if voting weight is less than proposal threshold
    if (!proposalTokenThreshold.isZero() && proposalTokenThreshold.lt(votingWeight)) {
      if (!thresholdToastId.current) {
        thresholdToastId.current = toast(
          'Voting weight is less than the required threshold to create proposals',
          {
            autoClose: false,
            progress: 1,
          }
        );
      }
      return false;
    } else {
      // dismiss toast
      toast.dismiss(thresholdToastId.current);
    }
    return true;
  }, [proposalTokenThreshold, votingWeight]);

  const isValidProposal = useMemo(() => {
    // if proposalData doesn't exist
    if (!proposalData) {
      return false;
    }

    // if error in transactions
    const hasError = transactions.some(
      (transaction: TransactionData) => transaction.addressError || transaction.fragmentError
    );
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

  const isNextDisabled = useMemo(
    () => !canUserCreateProposal || !proposalDescription.trim().length,
    [canUserCreateProposal, proposalDescription]
  );
  const isCreateDisabled = useMemo(
    () => !canUserCreateProposal || !isValidProposal || pendingCreateTx,
    [pendingCreateTx, isValidProposal, canUserCreateProposal]
  );

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
              pending={pendingCreateTx}
            />
          )}
        </form>
        {step === 1 && (
          <div className="flex items-center justify-center border-b border-gray-300 py-4 mb-8">
            <TextButton
              onClick={addTransaction}
              disabled={pendingCreateTx}
              label="+ Add another transaction"
            />
          </div>
        )}
        <div className="flex items-center justify-center mt-4 space-x-4">
          {step === 1 && (
            <TextButton
              type="button"
              onClick={decrementStep}
              disabled={pendingCreateTx}
              icon={<LeftArrow />}
              label="Prev"
            />
          )}
          {step === 1 && (
            <PrimaryButton
              type="button"
              onClick={() =>
                submitProposal({
                  proposalData,
                  successCallback,
                })
              }
              disabled={isCreateDisabled}
              label="Create Proposal"
              isLarge
            />
          )}
          {step === 0 && (
            <SecondaryButton
              type="button"
              onClick={incrementStep}
              disabled={isNextDisabled}
              label="Next: Add Transactions"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProposalCreate;
