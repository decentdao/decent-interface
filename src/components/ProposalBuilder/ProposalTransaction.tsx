import {
  VStack,
  HStack,
  Text,
  Box,
  Flex,
  Icon,
  IconButton,
  Button,
  Accordion,
  AccordionPanel,
  AccordionItem,
  AccordionButton,
} from '@chakra-ui/react';
import { Plus, MinusCircle, CaretDown, CaretRight } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateProposalTransaction, ProposalBuilderMode } from '../../types/proposalBuilder';
import { scrollToBottom } from '../../utils/ui';
import ABISelector, { ABIElement } from '../ui/forms/ABISelector';
import ExampleLabel from '../ui/forms/ExampleLabel';
import { BigIntComponent, InputComponent } from '../ui/forms/InputComponent';
import Divider from '../ui/utils/Divider';
import { DEFAULT_PROPOSAL_TRANSACTION } from './constants';

interface ProposalTransactionProps {
  transaction: CreateProposalTransaction;
  transactionIndex: number;
  transactionPending: boolean;
  txAddressError?: string;
  txFunctionError?: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
  mode: ProposalBuilderMode;
}

export default function ProposalTransaction({
  transaction,
  transactionIndex,
  transactionPending,
  txAddressError,
  txFunctionError,
  setFieldValue,
  mode,
}: ProposalTransactionProps) {
  const isProposalMode = mode === ProposalBuilderMode.PROPOSAL;
  const { t } = useTranslation(['proposal', 'proposalTemplate', 'common']);
  const [expandedIndecies, setExpandedIndecies] = useState<number[]>([0]);

  const handleABISelectorChange = useCallback(
    (value: ABIElement) => {
      setFieldValue(`transactions.${transactionIndex}.functionName`, value.name);
      setFieldValue(
        `transactions.${transactionIndex}.parameters`,
        value.inputs.map(abiInput => ({
          signature: `${abiInput.type} ${abiInput.name}`,
          label: '',
          value: '',
        })),
      );
    },
    [setFieldValue, transactionIndex],
  );

  return (
    <VStack
      align="left"
      spacing={4}
      mt={6}
    >
      <InputComponent
        label={t('labelTargetAddress')}
        helper={t('helperTargetAddress')}
        isRequired
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
      {transaction.targetAddress && (
        <Box mt="1.5rem">
          <ABISelector
            target={transaction.targetAddress}
            onChange={handleABISelectorChange}
          />
        </Box>
      )}
      <Box my="1.5rem">
        <Divider />
      </Box>
      <Box>
        <Text
          textStyle="display-lg"
          mb="1.5rem"
        >
          {t('functionHeader')}
        </Text>
        <InputComponent
          label={t('labelFunctionName')}
          helper={t('helperFunctionName')}
          isRequired={false}
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
      <Box>
        <Accordion
          allowMultiple
          index={expandedIndecies}
        >
          {transaction.parameters.map((parameter, i) => (
            <AccordionItem
              key={i}
              borderTop="none"
              borderBottom="none"
              padding="1rem"
              borderRadius={4}
              bg="neutral-3"
            >
              {({ isExpanded }) => (
                <>
                  <Box>
                    <HStack justify="space-between">
                      <AccordionButton
                        onClick={() => {
                          setExpandedIndecies(indexArray => {
                            if (indexArray.includes(i)) {
                              const newTxArr = [...indexArray];
                              newTxArr.splice(newTxArr.indexOf(i), 1);
                              return newTxArr;
                            } else {
                              return [...indexArray, i];
                            }
                          });
                        }}
                        p={0}
                        textStyle="display-lg"
                        color="lilac-0"
                      >
                        <Text textStyle="display-lg">
                          <Flex
                            alignItems="center"
                            gap={2}
                          >
                            {isExpanded ? <CaretDown /> : <CaretRight />}
                            {t('parameter')} {i + 1}
                          </Flex>
                        </Text>
                      </AccordionButton>
                      {i !== 0 || transaction.parameters.length !== 1 ? (
                        <IconButton
                          icon={<MinusCircle />}
                          aria-label={t('removetransactionlabel')}
                          variant="unstyled"
                          onClick={() =>
                            setFieldValue(
                              `transactions.${transactionIndex}.parameters`,
                              transaction.parameters.filter(
                                (parameterToRemove, parameterToRemoveIndex) =>
                                  parameterToRemoveIndex !== i,
                              ),
                            )
                          }
                          minWidth="auto"
                          color="lilac-0"
                          _disabled={{ opacity: 0.4, cursor: 'default' }}
                          sx={{ '&:disabled:hover': { color: 'inherit', opacity: 0.4 } }}
                          disabled={transactionPending}
                        />
                      ) : (
                        <Box h="2.25rem" />
                      )}
                    </HStack>
                    <AccordionPanel p={0}>
                      <Flex
                        gap={2}
                        mt={6}
                      >
                        <Box>
                          <InputComponent
                            label={t('labelFunctionParameter', { ns: 'proposalTemplate' })}
                            helper={t('helperFunctionParameter', { ns: 'proposalTemplate' })}
                            isRequired
                            value={parameter.signature}
                            onChange={e =>
                              setFieldValue(
                                `transactions.${transactionIndex}.parameters.${i}.signature`,
                                e.target.value,
                              )
                            }
                            disabled={transactionPending}
                            subLabel={
                              <HStack>
                                <Text>
                                  {t('example', { ns: 'common' })}:{' '}
                                  <ExampleLabel bg="neutral-4">address to</ExampleLabel>{' '}
                                  {t('or', { ns: 'common' })}{' '}
                                  <ExampleLabel bg="neutral-4">uint amount</ExampleLabel>
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
                            {!isProposalMode && (
                              <>
                                <InputComponent
                                  label={t('labelParameterLabel', { ns: 'proposalTemplate' })}
                                  helper=""
                                  isRequired={!parameter.value}
                                  value={parameter.label || ''}
                                  onChange={e =>
                                    setFieldValue(
                                      `transactions.${transactionIndex}.parameters.${i}.label`,
                                      e.target.value,
                                    )
                                  }
                                  disabled={transactionPending || !!parameter.value}
                                  testId={`transactions.${transactionIndex}.parameters.${i}.label`}
                                  subLabel={
                                    <HStack>
                                      <Text>
                                        {t('helperParameterLabel', { ns: 'proposalTemplate' })}
                                      </Text>
                                    </HStack>
                                  }
                                  gridContainerProps={{
                                    display: 'inline-flex',
                                    flexWrap: 'wrap',
                                    width: '30%',
                                  }}
                                  inputContainerProps={{
                                    width: '100%',
                                  }}
                                />
                                <Text>{t('or', { ns: 'common' })}</Text>
                              </>
                            )}
                            <InputComponent
                              label={t('labelParameterValue', { ns: 'proposalTemplate' })}
                              helper=""
                              isRequired={!parameter.label}
                              value={parameter.value || ''}
                              onChange={e =>
                                setFieldValue(
                                  `transactions.${transactionIndex}.parameters.${i}.value`,
                                  e.target.value,
                                )
                              }
                              disabled={transactionPending || !!parameter.label}
                              subLabel={
                                <HStack wordBreak="break-all">
                                  <Text>
                                    {t('example', { ns: 'common' })}:{' '}
                                    <ExampleLabel bg="neutral-4">value</ExampleLabel>
                                    {!isProposalMode && (
                                      <Text as="span">
                                        {t('proposalTemplateLeaveBlank', {
                                          ns: 'proposalTemplate',
                                        })}
                                      </Text>
                                    )}
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
                          <Box my="1rem">
                            <Divider variant="light" />
                          </Box>
                        </Box>
                      </Flex>
                    </AccordionPanel>
                  </Box>
                  {!isExpanded && (
                    <Box mt="0.5rem">
                      <Divider variant="light" />
                    </Box>
                  )}
                  {i === transaction.parameters.length - 1 && (
                    <Button
                      onClick={() => {
                        setFieldValue(`transactions.${transactionIndex}.parameters`, [
                          ...transaction.parameters,
                          DEFAULT_PROPOSAL_TRANSACTION,
                        ]);
                        setExpandedIndecies([transaction.parameters.length]);
                        scrollToBottom();
                      }}
                      variant="text"
                      color="celery-0"
                      pl={0}
                      mt={1}
                    >
                      <Icon as={Plus} />
                      {t('addParameter')}
                    </Button>
                  )}
                </>
              )}
            </AccordionItem>
          ))}
        </Accordion>
        <Box mt={6}>
          <BigIntComponent
            label={t('labelEthValue')}
            helper={t('helperEthValue')}
            isRequired={false}
            disabled={transactionPending}
            subLabel={
              <VStack
                align="start"
                spacing={0}
              >
                <HStack>
                  <Text>{`${t('example', { ns: 'common' })}:`}</Text>
                  <ExampleLabel>1.2</ExampleLabel>
                </HStack>
                {!isProposalMode && (
                  <Text>{t('ethParemeterHelper', { ns: 'proposalTemplate' })}</Text>
                )}
              </VStack>
            }
            errorMessage={undefined}
            value={transaction.ethValue.bigintValue}
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
