import { VStack, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CreateProposalTransaction } from '../../types/createProposal';
import { BigNumberComponent, InputComponent } from './InputComponent';

interface TransactionProps {
  transaction: CreateProposalTransaction;
  transactionIndex: number;
  transactionPending: boolean;
  txAddressError?: string;
  txFunctionError?: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

function Transaction({
  transaction,
  transactionIndex,
  transactionPending,
  txAddressError,
  txFunctionError,
  setFieldValue,
}: TransactionProps) {
  const { t } = useTranslation(['proposal', 'common']);

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
        disabled={transactionPending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>0x4168592...</Text>
          </HStack>
        }
        errorMessage={transaction.targetAddress && txAddressError ? txAddressError : undefined}
        value={transaction.targetAddress}
        testId="transaction.targetAddress"
        onChange={e =>
          setFieldValue(`transactions.${transactionIndex}.targetAddress`, e.target.value)
        }
      />

      <InputComponent
        label={t('labelFunctionName')}
        helper={t('helperFunctionName')}
        isRequired={true}
        value={transaction.functionName}
        onChange={e =>
          setFieldValue(`transactions.${transactionIndex}.functionName`, e.target.value)
        }
        disabled={transactionPending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>transfer</Text>
          </HStack>
        }
        // @todo update withn new error messages
        errorMessage={undefined}
        testId="transaction.functionName"
      />
      <InputComponent
        label={t('labelFunctionSignature')}
        helper={t('helperFunctionSignature')}
        isRequired={false}
        value={transaction.functionSignature}
        onChange={e =>
          setFieldValue(`transactions.${transactionIndex}.functionSignature`, e.target.value)
        }
        disabled={transactionPending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>address, uint256</Text>
          </HStack>
        }
        testId="transaction.functionSignature"
        errorMessage={
          transaction.functionSignature && txFunctionError ? txFunctionError : undefined
        }
      />
      <InputComponent
        label={t('labelParameters')}
        helper={t('helperParameters')}
        isRequired={false}
        value={transaction.parameters}
        onChange={e => setFieldValue(`transactions.${transactionIndex}.parameters`, e.target.value)}
        disabled={transactionPending}
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
        errorMessage={transaction.parameters && txFunctionError ? txFunctionError : undefined}
      />

      <BigNumberComponent
        label={t('labelEthValue')}
        helper={t('helperEthValue')}
        isRequired={false}
        disabled={transactionPending}
        subLabel={
          <HStack>
            <Text>{`${t('example', { ns: 'common' })}:`}</Text>
            <Text {...exampleLabelStyle}>{'1.2'}</Text>
          </HStack>
        }
        errorMessage={undefined}
        value={transaction.ethValue.bigNumberValue}
        onChange={e => {
          setFieldValue(`transactions.${transactionIndex}.ethValue`, e);
        }}
        decimalPlaces={18}
      />
    </VStack>
  );
}

export default Transaction;
