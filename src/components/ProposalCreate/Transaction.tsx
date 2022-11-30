import { Input, Button } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { constants, ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { logError } from '../../helpers/errorLogging';
import { checkAddress } from '../../hooks/utils/useAddress';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { TransactionData } from '../../types/transaction';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';

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
            <Button
              variant="text"
              minWidth="0px"
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
            >
              {t('labelRemoveTransaction')}
            </Button>
          </div>
        )}
      </div>
      <InputBox>
        <LabelWrapper
          label={t('labelTargetAddress')}
          subLabel={t('helperTargetAddress')}
          errorMessage={transaction.addressError}
        >
          <Input
            value={transaction.targetAddress}
            placeholder={constants.AddressZero}
            onChange={e => updateTargetAddress(e.target.value)}
            disabled={pending}
          />
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('labelFunctionName')}
          subLabel={t('helperFunctionName')}
          errorMessage={transaction.fragmentError}
        >
          <Input
            type="text"
            value={transaction.functionName}
            onChange={e => updateFunctionName(e.target.value)}
            placeholder={'transfer'}
            disabled={pending}
          />
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('labelFunctionSignature')}
          subLabel={t('helperFunctionSignature')}
          errorMessage={transaction.fragmentError}
        >
          <Input
            size="xl"
            value={transaction.functionSignature}
            onChange={e => updateFunctionSignature(e.target.value)}
            disabled={pending}
            placeholder={'address to, uint amount'}
          />
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('labelParameters')}
          subLabel={t('helperParameters')}
          errorMessage={transaction.fragmentError}
        >
          <Input
            size="xl"
            value={transaction.parameters}
            onChange={e => updateParameters(e.target.value)}
            disabled={pending}
            placeholder={'"0xADC74eE329a23060d3CB431Be0AB313740c191E7", "1000000000000000000"'}
          />
        </LabelWrapper>
      </InputBox>
    </ContentBox>
  );
}

export default Transaction;
