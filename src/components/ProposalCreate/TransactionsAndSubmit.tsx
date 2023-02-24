import { Button, Flex, Text, VStack, Divider, Alert, AlertTitle } from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { Formik } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Transactions from '../../components/ProposalCreate/Transactions';
import { ProposalExecuteData, ProposalFormState } from '../../types/proposal';
import { TransactionData } from '../../types/transaction';

const defaultTransaction = {
  targetAddress: '',
  ethValue: { value: '0', bigNumberValue: BigNumber.from('0') },
  functionName: '',
  functionSignature: '',
  parameters: '',
  isExpanded: true,
  encodedFunctionData: undefined,
};

const defaultProposal: ProposalFormState = {
  proposalDescription: '',
  transactions: [defaultTransaction],
  proposalData: {
    title: '',
    description: '',
    documentationUrl: '',
  },
  nonce: undefined,
};

export interface TransactionsAndSubmitProps {
  show: boolean | undefined;
  showBackButton: boolean;
  onGoBack: () => void;
  pendingCreateTx: boolean;
  submitProposal: ({
    proposalData,
    nonce,
    pendingToastMessage,
    failedToastMessage,
    successToastMessage,
    successCallback,
  }: {
    proposalData: ProposalExecuteData | undefined;
    nonce: number | undefined;
    pendingToastMessage: string;
    failedToastMessage: string;
    successToastMessage: string;
    successCallback?: ((daoAddress: string) => void) | undefined;
  }) => Promise<void>;
  proposalData: ProposalExecuteData | undefined;
  nonce: number | undefined;
  successCallback: () => void;
  setTransactions: Dispatch<SetStateAction<TransactionData[]>>;
}

function TransactionsAndSubmit({
  show,
  showBackButton,
  onGoBack,
  pendingCreateTx,
  submitProposal,
  proposalData,
  nonce,
  successCallback,
  setTransactions,
}: TransactionsAndSubmitProps) {
  const { t } = useTranslation(['proposal', 'common']);

  if (!show) return null;

  return (
    <Formik<ProposalFormState>
      initialValues={defaultProposal}
      onSubmit={() => {
        submitProposal({
          proposalData,
          nonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage'),
          failedToastMessage: t('proposalCreateFailureToastMessage'),
          successCallback,
        });
      }}
    >
      {({ handleSubmit, ...rest }) => {
        return (
          <form onSubmit={handleSubmit}>
            <Transactions
              setTransactions={setTransactions}
              // removeTransaction={removeTransaction}
              pending={pendingCreateTx}
              {...rest}
            />
            <VStack
              align="left"
              spacing={6}
              pt={2}
            >
              <Button
                variant="text"
                // onClick={addTransaction}
                disabled={pendingCreateTx}
                w="fit-content"
                pl={0}
              >
                {t('labelAddTransaction')}
              </Button>
              <Alert
                status="info"
                w="fit-full"
              >
                <Info boxSize="24px" />
                <AlertTitle>
                  <Text
                    textStyle="text-lg-mono-medium"
                    whiteSpace="pre-wrap"
                  >
                    {t('transactionExecutionAlertMessage')}
                  </Text>
                </AlertTitle>
              </Alert>
              <Divider color="chocolate.700" />
              <Flex>
                {showBackButton && (
                  <Button
                    variant="text"
                    textStyle="text-md-mono-regular"
                    color="gold.500"
                    cursor="pointer"
                    onClick={onGoBack}
                    mb={4}
                  >
                    {`< ${t('proposalBack')}`}
                  </Button>
                )}
                <Button
                  w="100%"
                  type="submit"
                  // disabled={isCreateDisabled}
                >
                  {t('createProposal')}
                </Button>
              </Flex>
            </VStack>
          </form>
        );
      }}
    </Formik>
  );
}

export default TransactionsAndSubmit;
