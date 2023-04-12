import { VStack, HStack, Text, Box, Flex, IconButton } from '@chakra-ui/react';
import { AddPlus, Trash } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { CreateProposalTemplateTransaction } from '../../types/createProposalTemplate';
import ExampleLabel from '../ui/forms/ExampleLabel';
import { BigNumberComponent, InputComponent } from '../ui/forms/InputComponent';
import { DEFAULT_PROPOSAL_TEMPLATE_TRANSACTION } from './constants';

interface ProposalTemplateTransactionProps {
  transaction: CreateProposalTemplateTransaction;
  transactionIndex: number;
  transactionPending: boolean;
  txAddressError?: string;
  txFunctionError?: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

export default function ProposalTemplateTransaction({
  transaction,
  transactionIndex,
  transactionPending,
  txAddressError,
  txFunctionError,
  setFieldValue,
}: ProposalTemplateTransactionProps) {
  const { t } = useTranslation(['proposal', 'proposalTemplate', 'common']);

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
            errorMessage={transaction.functionName && txFunctionError ? txFunctionError : undefined}
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
                      DEFAULT_PROPOSAL_TEMPLATE_TRANSACTION,
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
                label={t('labelFunctionParameter', { ns: 'proposalTemplate' })}
                helper={t('helperFunctionParameter', { ns: 'proposalTemplate' })}
                isRequired
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
                    <Text>
                      {t('example', { ns: 'common' })}: <ExampleLabel>address to</ExampleLabel>{' '}
                      {t('or', { ns: 'common' })} <ExampleLabel>uint amount</ExampleLabel>
                    </Text>
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
                  label={t('labelParameterLabel', { ns: 'proposalTemplate' })}
                  helper=""
                  isRequired={!parameter.value}
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
                      <Text>{t('helperParameterLabel', { ns: 'proposalTemplate' })}</Text>
                    </HStack>
                  }
                  gridContainerProps={{
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                    width: '27%',
                  }}
                  inputContainerProps={{
                    width: '100%',
                  }}
                />
                <Text>{t('or', { ns: 'common' })}</Text>
                <InputComponent
                  label={t('labelParameterValue', { ns: 'proposalTemplate' })}
                  helper=""
                  isRequired={!parameter.label}
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
                      <Text>
                        {t('example', { ns: 'common' })}: <ExampleLabel>value</ExampleLabel>
                        <Text as="span">
                          {t('proposalTemplateLeaveBlank', { ns: 'proposalTemplate' })}
                        </Text>
                      </Text>
                    </HStack>
                  }
                  testId={`transactions.${transactionIndex}.parameters.${i}.value`}
                  gridContainerProps={{
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                    flex: '1',
                  }}
                  inputContainerProps={{
                    width: '100%',
                  }}
                />
              </Flex>
            </Box>
            {i !== 0 && (
              <Flex
                flex={1}
                alignItems="center"
                justifyContent="center"
                bg="black.900"
                px={2}
                w="32px"
              >
                <IconButton
                  aria-label="Remove function parameter"
                  w="16px"
                  minW="16px"
                  h="16px"
                  borderRadius="100%"
                  variant="secondary"
                  onClick={() =>
                    setFieldValue(
                      `transactions.${transactionIndex}.parameters`,
                      transaction.parameters.filter(
                        (parameterToRemove, parameterToRemoveIndex) => parameterToRemoveIndex !== i
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
