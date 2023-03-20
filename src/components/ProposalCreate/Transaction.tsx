import { VStack, HStack, Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { logError } from '../../helpers/errorLogging';
import { BigNumberValuePair } from '../../types';
import { TransactionData } from '../../types/transaction';
import { BigNumberComponent, EthAddressComponent, InputComponent } from './InputComponent';

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
      return new utils.Interface([functionSignature]).encodeFunctionData(functionName, parameters);
    } catch (e) {
      logError(e);
      return;
    }
  };

  const updateTargetAddress = (targetAddress: string, isValidAddress: boolean) => {
    const transactionCopy = {
      ...transaction,
      targetAddress: targetAddress.trim(),
      addressError:
        !isValidAddress && targetAddress.trim()
          ? t('errorInvalidAddress', { ns: 'common' })
          : undefined,
    };
    updateTransaction(transactionCopy, transactionNumber);
  };

  const updateEthValue = (ethValue: BigNumberValuePair) => {
    const transactionCopy = {
      ...transaction,
      ethValue,
    };
    updateTransaction(transactionCopy, transactionNumber);
  };

  const updateTransactionValue = (
    value: string,
    encodedFunctionData: string | undefined,
    key: keyof TransactionData
  ) => {
    const transactionCopy = {
      ...transaction,
      [key]: value,
      encodedFunctionData: encodedFunctionData,
      fragmentError: !encodeFunctionData ? t('errorInvalidFragments') : undefined,
    };
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
      <EthAddressComponent
        label={t('labelTargetAddress')}
        helper={t('helperTargetAddress')}
        isRequired={true}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>0x4168592...</Text>
          </HStack>
        }
        errorMessage={transaction.addressError}
        onAddressChange={function (address: string, isValid: boolean): void {
          updateTargetAddress(address, isValid);
        }}
      />
      <InputComponent
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
        testId="transaction.functionName"
      />
      <InputComponent
        label={t('labelFunctionSignature')}
        helper={t('helperFunctionSignature')}
        isRequired={false}
        value={transaction.functionSignature}
        onChange={e => updateFunctionSignature(e.target.value)}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>address, uint256</Text>
          </HStack>
        }
        testId="transaction.functionSignature"
        errorMessage={transaction.fragmentError}
      />
      <InputComponent
        label={t('labelParameters')}
        helper={t('helperParameters')}
        isRequired={false}
        value={transaction.parameters}
        onChange={e => updateParameters(e.target.value)}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text
              {...exampleLabelStyle}
              wordBreak="break-all"
            >
              {'0xADC74eE329a23060d3CB431Be0AB313740c191E7, 1000000000'}
            </Text>
          </HStack>
        }
        testId="transaction.parameters"
        errorMessage={transaction.fragmentError}
      />
      <BigNumberComponent
        label={t('labelEthValue')}
        helper={t('helperEthValue')}
        isRequired={false}
        disabled={pending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>{'1.2'}</Text>
          </HStack>
        }
        errorMessage={transaction.fragmentError}
        value={transaction.ethValue.bigNumberValue}
        onChange={updateEthValue}
        decimalPlaces={18}
      />
    </VStack>
  );
}

export default Transaction;
