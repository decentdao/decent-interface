import { VStack, HStack, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { logError } from '../../helpers/errorLogging';
import { checkAddress } from '../../hooks/utils/useAddress';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { TransactionData } from '../../types/transaction';
import { InputComponent, TextareaComponent } from './InputComponent';

interface TransactionProps {
  transaction: TransactionData;
  transactionNumber: number;
  pending: boolean;
  updateTransaction: (transactionData: TransactionData, transactionNumber: number) => void;
}

function Transaction({
  transaction,
  transactionNumber,
  pending,
  updateTransaction,
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

  const exampleLabelStyle = {
    bg: 'chocolate.700',
    borderRadius: '4px',
    px: '4px',
    py: '1px',
    color: 'grayscale.100',
    fontSize: '12px',
  };

  return (
    <VStack
      align="left"
      spacing={4}
      mt={6}
    >
      <InputComponent
        label={t('labelTargetAddress')}
        helper={t('helperTargetAddress')}
        isRequired={true}
        value={transaction.targetAddress}
        onChange={e => updateTargetAddress(e.target.value)}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>yourdomain.eth</Text>
            <Text>{` ${t('or', { ns: 'common' })} `}</Text>
            <Text {...exampleLabelStyle}>0x4168592...</Text>
          </HStack>
        }
        errorMessage={transaction.addressError}
      />
      <TextareaComponent
        label={t('labelFunctionName')}
        helper={t('helperFunctionName')}
        isRequired={true}
        value={transaction.functionName}
        onChange={e => updateFunctionName(e.target.value)}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>transfer</Text>
          </HStack>
        }
        errorMessage={transaction.fragmentError}
      />
      <TextareaComponent
        label={t('labelFunctionSignature')}
        helper={t('helperFunctionSignature')}
        isRequired={false}
        value={transaction.functionSignature}
        onChange={e => updateFunctionSignature(e.target.value)}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>address to, uint amount</Text>
          </HStack>
        }
        errorMessage={transaction.fragmentError}
      />
      <TextareaComponent
        label={t('labelParameters')}
        helper={t('helperParameters')}
        isRequired={false}
        value={transaction.parameters}
        onChange={e => updateParameters(e.target.value)}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>
              {'"0xADC74eE329a23060d3CB431Be0AB313740c191E7", 1000000000'}
            </Text>
          </HStack>
        }
        errorMessage={transaction.fragmentError}
      />
    </VStack>
  );
}

export default Transaction;
