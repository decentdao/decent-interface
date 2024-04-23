import {
  Box,
  Flex,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { MinusCircle, CaretDown, CaretRight } from '@phosphor-icons/react';
import { FormikErrors, FormikProps } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { BigIntValuePair } from '../../types';
import {
  CreateProposalForm,
  CreateProposalTransaction,
  ProposalBuilderMode,
} from '../../types/proposalBuilder';
import ProposalTransaction from './ProposalTransaction';

interface ProposalTransactionsProps extends FormikProps<CreateProposalForm> {
  pendingTransaction: boolean;
  expandedIndecies: number[];
  setExpandedIndecies: Dispatch<SetStateAction<number[]>>;
  mode: ProposalBuilderMode;
}
export default function ProposalTransactions({
  values: { transactions },
  errors,
  setFieldValue,
  pendingTransaction,
  expandedIndecies,
  setExpandedIndecies,
  mode,
}: ProposalTransactionsProps) {
  const { t } = useTranslation(['proposal', 'proposalTemplate', 'common']);

  const removeTransaction = (transactionIndex: number) => {
    setFieldValue(
      'transactions',
      transactions.filter((tx, i) => i !== transactionIndex),
    );
  };
  return (
    <Accordion
      allowMultiple
      index={expandedIndecies}
    >
      {transactions.map((_, index) => {
        const txErrors = errors?.transactions?.[index] as
          | FormikErrors<CreateProposalTransaction<BigIntValuePair>>
          | undefined;
        const txAddressError = txErrors?.targetAddress;
        const txFunctionError = txErrors?.functionName;

        return (
          <AccordionItem
            key={index}
            borderTop="none"
            borderBottom="none"
            my="1.5rem"
          >
            {({ isExpanded }) => (
              <Box
                borderRadius={4}
                p={3}
                my="2"
              >
                <HStack justify="space-between">
                  <AccordionButton
                    onClick={() => {
                      setExpandedIndecies(indexArray => {
                        if (indexArray.includes(index)) {
                          const newTxArr = [...indexArray];
                          newTxArr.splice(newTxArr.indexOf(index), 1);
                          return newTxArr;
                        } else {
                          return [...indexArray, index];
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
                        {t('transaction')} {index + 1}
                      </Flex>
                    </Text>
                  </AccordionButton>
                  {index !== 0 || transactions.length !== 1 ? (
                    <IconButton
                      icon={<MinusCircle />}
                      aria-label={t('removetransactionlabel')}
                      variant="unstyled"
                      onClick={() => removeTransaction(index)}
                      minWidth="auto"
                      color="lilac-0"
                      _disabled={{ opacity: 0.4, cursor: 'default' }}
                      sx={{ '&:disabled:hover': { color: 'inherit', opacity: 0.4 } }}
                      disabled={pendingTransaction}
                    />
                  ) : (
                    <Box h="2.25rem" />
                  )}
                </HStack>
                <AccordionPanel p={0}>
                  <ProposalTransaction
                    transaction={transactions[index] as CreateProposalTransaction}
                    txFunctionError={txFunctionError}
                    txAddressError={txAddressError}
                    transactionIndex={index}
                    setFieldValue={setFieldValue}
                    transactionPending={pendingTransaction}
                    mode={mode}
                  />
                </AccordionPanel>
              </Box>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
