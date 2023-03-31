import { VStack, HStack, Text, Box, Flex, IconButton } from '@chakra-ui/react';
import { AddPlus, Trash } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { CreateIntegrationTransaction } from '../../types/createIntegration';
import ExampleLabel from '../ui/forms/ExampleLabel';
import { BigNumberComponent, InputComponent } from '../ui/forms/InputComponent';
import { DEFAULT_INTEGRATION_TRANSACTION } from './constants';

interface IntegrationTransactionProps {
  transaction: CreateIntegrationTransaction;
  transactionIndex: number;
  transactionPending: boolean;
  txAddressError?: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

export default function IntegrationTransaction({
  transaction,
  transactionIndex,
  transactionPending,
  txAddressError,
  setFieldValue,
}: IntegrationTransactionProps) {
  const { t } = useTranslation(['proposal', 'integration', 'common']);

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
            <Text>{t('example', { ns: 'common' })}:</Text>
            <ExampleLabel>yourdomain.eth</ExampleLabel>
            <Text>{t('or', { ns: 'common' })}</Text>
            <ExampleLabel>0x4168592...</ExampleLabel>
          </HStack>
        }
        errorMessage={transaction.targetAddress && txAddressError ? txAddressError : undefined}
        value={transaction.targetAddress}
        testId="transaction.targetAddress"
        onChange={e =>
          setFieldValue(`transactions.${transactionIndex}.targetAddress`, e.target.value)
        }
      />
      <Box
        backgroundColor="black"
        borderRadius="4px"
        px={4}
        py={8}
      >
        <Box pl={10}>
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
                <ExampleLabel>transfer</ExampleLabel>
              </HStack>
            }
            errorMessage={undefined}
            testId="transaction.functionName"
          />
        </Box>
        {transaction.parameters.map((parameter, i) => (
          <Flex
            key={i}
            gap={2}
            mt={6}
            pl={
              i !== transaction.parameters.length - 1 && transaction.parameters.length > 1 ? 10 : 0
            }
          >
            {i === transaction.parameters.length - 1 && (
              <Flex
                flex={1}
                alignItems="center"
                justifyContent="center"
                bg="black.900"
                px={2}
                w="32px"
              >
                <IconButton
                  aria-label="Add function parameter"
                  w="16px"
                  minW="16px"
                  h="16px"
                  borderRadius="100%"
                  variant="secondary"
                  onClick={() =>
                    setFieldValue(`transactions.${transactionIndex}.parameters`, [
                      ...transaction.parameters,
                      DEFAULT_INTEGRATION_TRANSACTION,
                    ])
                  }
                >
                  <AddPlus />
                </IconButton>
              </Flex>
            )}
            <Box
              bg="black.900"
              padding={6}
            >
              <InputComponent
                label={t('labelFunctionParameter', { ns: 'integration' })}
                helper={t('helperFunctionParameter', { ns: 'integration' })}
                isRequired={false}
                value={parameter.signature}
                onChange={e =>
                  setFieldValue(
                    `transactions.${transactionIndex}.parameters.${i}.signature`,
                    e.target.value
                  )
                }
                disabled={transactionPending}
                subLabel={
                  <HStack>
                    <Text>{`${t('example', { ns: 'common' })}:`}</Text>
                    <ExampleLabel>address, uint256</ExampleLabel>
                  </HStack>
                }
                testId={`transactions.${transactionIndex}.parameters.${i}.signature`}
              />
              <Flex
                gap={4}
                alignItems="center"
                mt={4}
              >
                <InputComponent
                  label={t('labelParameterLabel', { ns: 'integration' })}
                  helper=""
                  isRequired={false}
                  value={parameter.label || ''}
                  onChange={e =>
                    setFieldValue(
                      `transactions.${transactionIndex}.parameters.${i}.label`,
                      e.target.value
                    )
                  }
                  disabled={transactionPending || !!parameter.value}
                  testId={`transactions.${transactionIndex}.parameters.${i}.label`}
                  subLabel={
                    <HStack>
                      <Text>{t('helperParameterLabel', { ns: 'integration' })}</Text>
                    </HStack>
                  }
                  gridContainerProps={{
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                  }}
                />
                <Text>{t('or', { ns: 'common' })}</Text>
                <InputComponent
                  label={t('labelParameterValue', { ns: 'integration' })}
                  helper=""
                  isRequired={false}
                  value={parameter.value || ''}
                  onChange={e =>
                    setFieldValue(
                      `transactions.${transactionIndex}.parameters.${i}.value`,
                      e.target.value
                    )
                  }
                  disabled={transactionPending || !!parameter.label}
                  subLabel={
                    <HStack wordBreak="break-all">
                      <Text>{t('example', { ns: 'common' })}:</Text>
                      <ExampleLabel>value</ExampleLabel>
                      <Text as="span">{t('integrationLeaveBlank', { ns: 'integration' })}</Text>
                    </HStack>
                  }
                  testId={`transactions.${transactionIndex}.parameters.${i}.value`}
                  gridContainerProps={{
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                  }}
                />
              </Flex>
            </Box>
            {transaction.parameters.length > 1 && i !== 0 && (
              <Flex
                flex={1}
                alignItems="center"
                justifyContent="center"
                bg="black.900"
                px={2}
                w="32px"
              >
                <IconButton
                  aria-label="Add function parameter"
                  w="16px"
                  minW="16px"
                  h="16px"
                  borderRadius="100%"
                  variant="secondary"
                  onClick={() =>
                    setFieldValue(
                      `transactions.${transactionIndex}.parameters`,
                      transaction.parameters.filter(
                        (parameterToRemove, parameterToRemoveIndex) => parameterToRemoveIndex === i
                      )
                    )
                  }
                >
                  <Trash />
                </IconButton>
              </Flex>
            )}
          </Flex>
        ))}
        <Box
          mt={6}
          pl={10}
        >
          <BigNumberComponent
            label={t('labelEthValue')}
            helper={t('helperEthValue')}
            isRequired={false}
            disabled={transactionPending}
            subLabel={
              <HStack>
                <Text>{`${t('example', { ns: 'common' })}:`}</Text>
                <ExampleLabel>{'1.2'}</ExampleLabel>
              </HStack>
            }
            errorMessage={undefined}
            value={transaction.ethValue.bigNumberValue}
            onChange={e => {
              setFieldValue(`transactions.${transactionIndex}.ethValue`, e);
            }}
            decimalPlaces={18}
          />
        </Box>
      </Box>
    </VStack>
  );
}
