import { useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import Essentials from '../../components/ProposalCreate/Essentials';
import Transactions from '../../components/ProposalCreate/Transactions';
import { TextButton, PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';
import LeftArrow from '../../components/ui/svg/LeftArrow';
import { TransactionData } from '../../types/transaction';
import { ProposalExecuteData } from '../../types/proposal';
import { useNavigate, useParams } from 'react-router-dom';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { logError } from '../../helpers/errorLogging';
import { useTranslation } from 'react-i18next';

const defaultTransaction = {
  targetAddress: '',
  functionName: '',
  functionSignature: '',
  parameters: '',
};

interface IProposalCreate {
  submitProposal: (proposal: {
    proposalData: ProposalExecuteData | undefined;
    successCallback: () => void;
  }) => void;
  pendingCreateTx: boolean;
  isUserAuthorized: boolean;
}

function ProposalCreate({ submitProposal, pendingCreateTx, isUserAuthorized }: IProposalCreate) {
  const {
    mvd: { dao },
    gnosis: { safe },
  } = useFractal();

  const [step, setStep] = useState<number>(0);
  const [proposalDescription, setProposalDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionData[]>([defaultTransaction]);
  const [proposalData, setProposalData] = useState<ProposalExecuteData>();
  const navigate = useNavigate();
  const params = useParams();
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

    if (dao) {
      navigate(`/daos/${dao.daoAddress}/modules/${params.moduleAddress}`);
    }

    if (safe) {
      navigate(`/daos/${safe.address}/governance`);
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
    () => !isUserAuthorized || !proposalDescription.trim().length,
    [isUserAuthorized, proposalDescription]
  );
  const isCreateDisabled = useMemo(
    () => !isUserAuthorized || !isValidProposal || pendingCreateTx,
    [pendingCreateTx, isValidProposal, isUserAuthorized]
  );

  const { t } = useTranslation(['proposal', 'common']);

  return (
    <div>
      <div>
        <H1>{t('createProposal')}</H1>
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
