import { VStack, HStack, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';
import { logError } from '../../helpers/errorLogging';
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
  const { t } = useTranslation(['proposal', 'common']);

  const encodeFunctionData = (
    functionName: string,
    dirtyfunctionSignature: string,
    dirtyParameters: string
  ): string | undefined => {
    const functionSignature = `function ${functionName}(${dirtyfunctionSignature})`;
    const parameters = !!dirtyParameters
      ? dirtyParameters.split(',').map(p => (p = p.trim()))
      : undefined;
    try {
      return new ethers.utils.Interface([functionSignature]).encodeFunctionData(
        functionName,
        parameters
      );
    } catch (e) {
      logError(e); //can we get this to not show in the console??
      return;
    }
  };

  const updateTargetAddress = (targetAddress: string) => {
    const isValidAddress = !!targetAddress
      ? ethers.utils.isAddress(targetAddress.trim().toLowerCase())
      : undefined;

    const transactionCopy = Object.assign({}, transaction);
    transactionCopy.targetAddress = targetAddress.trim();
    transactionCopy.addressError =
      !isValidAddress && targetAddress.trim()
        ? t('errorInvalidAddress', { ns: 'common' })
        : undefined;
    updateTransaction(transactionCopy, transactionNumber);
  };

  const updateTransactionValue = (
    value: string,
    encodedFunctionData: string | undefined,
    key: keyof TransactionData
  ) => {
    const transactionCopy = { ...transaction, [key]: value };
    transactionCopy.encodedFunctionData = encodedFunctionData;
    transactionCopy.fragmentError = !encodeFunctionData ? t('errorInvalidFragments') : undefined;
    console.log('trans update', transactionCopy);
    updateTransaction(transactionCopy, transactionNumber);
  };

  const updateFunctionName = (functionName: string) => {
    const encodedFunctionData = encodeFunctionData(
      functionName,
      transaction.functionSignature,
      transaction.parameters
    );
    updateTransactionValue(functionName, encodedFunctionData, 'functionName');
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const encodedFunctionData = encodeFunctionData(
      transaction.functionName,
      functionSignature,
      transaction.parameters
    );
    updateTransactionValue(functionSignature, encodedFunctionData, 'functionSignature');
  };

  const updateParameters = (parameters: string) => {
    const encodedFunctionData = encodeFunctionData(
      transaction.functionName,
      transaction.functionSignature,
      parameters
    );
    updateTransactionValue(parameters, encodedFunctionData, 'parameters');
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
            <Text {...exampleLabelStyle}>address to, uint256 amount</Text>
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
              {'0xADC74eE329a23060d3CB431Be0AB313740c191E7, 1000000000'}
            </Text>
          </HStack>
        }
        errorMessage={transaction.fragmentError}
      />
    </VStack>
  );
}

export default Transaction;
