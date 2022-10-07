import ContentBoxTitle from '../ui/ContentBoxTitle';
import { TextButton } from '../ui/forms/Button';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import ContentBox from '../ui/ContentBox';
import { checkAddress } from '../../hooks/useAddress';
import { ethers } from 'ethers';
import { TransactionData } from '../../types/transaction';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../helpers/errorLogging';
import { useTranslation } from 'react-i18next';

interface TransactionProps {
  transaction: TransactionData;
  transactionNumber: number;
  pending: boolean;
  updateTransaction: (transactionData: TransactionData, transactionNumber: number) => void;
  removeTransaction: (transactionNumber: number) => void;
  transactionCount: number;
}

function Transaction({
  transaction,
  transactionNumber,
  pending,
  updateTransaction,
  removeTransaction,
  transactionCount,
}: TransactionProps) {
  const {
    state: { provider },
  } = useWeb3Provider();
  const { t } = useTranslation(['proposal', 'common']);

  const validateFunctionData = (
    functionName: string,
    functionSignature: string,
    parameters: string
  ): boolean => {
    const functionSignatureStr = `function ${functionName}(${functionSignature})`;
    const parametersArr = `[${parameters}]`;
    try {
      new ethers.utils.Interface([functionSignatureStr]).encodeFunctionData(
        functionName,
        JSON.parse(parametersArr)
      );
      return true;
    } catch (e) {
      logError(e);
      return false;
    }
  };

  const updateTargetAddress = async (targetAddress: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.targetAddress = targetAddress;
    let isValidAddress = false;
    if (targetAddress.trim()) {
      isValidAddress = await checkAddress(provider, targetAddress);
    }
    newTransactionData.addressError =
      !isValidAddress && targetAddress.trim()
        ? t('errorInvalidAddress', { ns: 'common' })
        : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionName = (functionName: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionName = functionName;
    const isValidFragment = validateFunctionData(
      functionName,
      transaction.functionSignature,
      transaction.parameters
    );
    newTransactionData.fragmentError = !isValidFragment ? t('errorInvalidFragments') : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionSignature = functionSignature;
    const isValidFragment = validateFunctionData(
      transaction.functionName,
      functionSignature,
      transaction.parameters
    );
    newTransactionData.fragmentError = !isValidFragment ? t('errorInvalidFragments') : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateParameters = (parameters: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.parameters = parameters;
    const isValidFragment = validateFunctionData(
      transaction.functionName,
      transaction.functionSignature,
      parameters
    );
    newTransactionData.fragmentError = !isValidFragment ? t('errorInvalidFragments') : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };
  return (
    <ContentBox>
      <div className="flex justify-between">
        <ContentBoxTitle>Transaction</ContentBoxTitle>
        {transactionCount > 1 && (
          <div className="flex justify-end">
            <TextButton
              className="mx-0 px-0 w-fit"
              onClick={() => removeTransaction(transactionNumber)}
              disabled={
                pending &&
                transaction.targetAddress.trim().length > 0 &&
                validateFunctionData(
                  transaction.functionName,
                  transaction.functionSignature,
                  transaction.parameters
                )
              }
              label={t('labelRemoveTransaction')}
            />
          </div>
        )}
      </div>
      <InputBox>
        <Input
          type="text"
          value={transaction.targetAddress}
          onChange={e => updateTargetAddress(e.target.value)}
          label={t('labelTargetAddress')}
          helperText={t('helperTargetAddress')}
          disabled={pending}
          errorMessage={transaction.addressError}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={transaction.functionName}
          onChange={e => updateFunctionName(e.target.value)}
          label={t('labelFunctionName')}
          exampleText={t('exampleFunctionName')}
          disabled={pending}
          helperText={t('helperFunctionName')}
          errorMessage={transaction.fragmentError}
        />
      </InputBox>
      <InputBox>
        <Input
          type="textarea"
          value={transaction.functionSignature}
          onChange={e => updateFunctionSignature(e.target.value)}
          label={t('labelFunctionSignature')}
          helperText={t('helperFunctionSignature')}
          disabled={pending}
          exampleText={t('exampleFunctionSignature')}
          errorMessage={transaction.fragmentError}
        />
      </InputBox>
      <InputBox>
        <Input
          type="textarea"
          value={transaction.parameters}
          onChange={e => updateParameters(e.target.value)}
          label={t('labelParameters')}
          helperText={t('helperParameters')}
          disabled={pending}
          exampleText={t('exampleParameters')}
          errorMessage={transaction.fragmentError}
        />
      </InputBox>
    </ContentBox>
  );
}

export default Transaction;
