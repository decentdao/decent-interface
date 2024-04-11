import {
  Box,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { ArrowDown, ArrowRight, Minus } from '@decent-org/fractal-ui';
import { FormikErrors, FormikProps } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumberValuePair } from '../../types';
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
          | FormikErrors<CreateProposalTransaction<BigNumberValuePair>>
          | undefined;
        const txAddressError = txErrors?.targetAddress;
        const txFunctionError = txErrors?.functionName;

        return (
          <AccordionItem
            key={index}
            borderTop="none"
            borderBottom="none"
          >
            {({ isExpanded }) => (
              <Box
                rounded="lg"
                p={3}
                my="2"
                bg="black.900"
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
                    textStyle="text-button-md-semibold"
                    color="grayscale.100"
                  >
                    {isExpanded ? <ArrowDown boxSize="1.5rem" /> : <ArrowRight fontSize="1.5rem" />}
                    {t('transaction')} {index + 1}
                  </AccordionButton>
                  {index !== 0 || transactions.length !== 1 ? (
                    <IconButton
                      icon={<Minus boxSize="1.5rem" />}
                      aria-label={t('removetransactionlabel')}
                      variant="unstyled"
                      onClick={() => removeTransaction(index)}
                      minWidth="auto"
                      _hover={{ color: 'gold.500' }}
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
