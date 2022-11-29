import { Text } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Essentials from '../../components/ProposalCreate/Essentials';
import Transactions from '../../components/ProposalCreate/Transactions';
import { PrimaryButton, SecondaryButton, TextButton } from '../../components/ui/forms/Button';
import LeftArrow from '../../components/ui/svg/LeftArrow';
import { logError } from '../../helpers/errorLogging';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import useSubmitProposal from '../../providers/Fractal/hooks/useSubmitProposal';
import { ProposalExecuteData } from '../../types/proposal';
import { TransactionData } from '../../types/transaction';

const defaultTransaction = {
  targetAddress: '',
  functionName: '',
  functionSignature: '',
  parameters: '',
};

function ProposalCreate() {
  const {
    gnosis: { safe },
  } = useFractal();

  const [step, setStep] = useState<number>(0);
  const [proposalDescription, setProposalDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionData[]>([defaultTransaction]);
  const [proposalData, setProposalData] = useState<ProposalExecuteData>();
  const navigate = useNavigate();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();

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

    if (safe) {
      navigate(`/daos/${safe.address}/proposals`);
    }
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
          if (transaction.functionName) {
            const funcSignature = `function ${transaction.functionName}(${transaction.functionSignature})`;
            const parametersArr = `[${transaction.parameters}]`;
            return new ethers.utils.Interface([funcSignature]).encodeFunctionData(
              transaction.functionName,
              JSON.parse(parametersArr)
            );
          }
          return '';
        }),
        description: proposalDescription,
      };
      setProposalData(proposal);
    } catch (e) {
      logError(e);
      // catches errors related to `ethers.utils.Interface` and the `encodeFunctionData`
      // these errors are handled in the onChange of the inputs in transactions
    }
  }, [transactions, proposalDescription]);

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

  const { t } = useTranslation(['proposal', 'common']);

  return (
    <div>
      <div>
        <Text>{t('createProposal')}</Text>
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
              label={t('labelAddTransaction')}
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
              label={t('prev', { ns: 'common' })}
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
              label={t('createProposal')}
              isLarge
            />
          )}
          {step === 0 && (
            <SecondaryButton
              type="button"
              onClick={incrementStep}
              disabled={isNextDisabled}
              label={t('labelAddTransactions')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProposalCreate;
