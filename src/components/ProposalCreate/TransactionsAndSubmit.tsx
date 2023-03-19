import { Button, Flex, Text, VStack, Divider, Alert, AlertTitle } from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import Transactions from '../../components/ProposalCreate/Transactions';
import { TransactionsAndSubmitProps } from '../../types';

function TransactionsAndSubmit({
  show,
  showBackButton,
  onGoBack,
  addTransaction,
  pendingCreateTx,
  submitProposal,
  proposalData,
  nonce,
  successCallback,
  isCreateDisabled,
  transactions,
  setTransactions,
  removeTransaction,
}: TransactionsAndSubmitProps) {
  const { t } = useTranslation(['proposal', 'common']);

  if (!show) return null;

  return (
    <>
      <form onSubmit={e => e.preventDefault()}>
        <Transactions
          transactions={transactions}
          setTransactions={setTransactions}
          removeTransaction={removeTransaction}
          pending={pendingCreateTx}
        />
      </form>
      <VStack
        align="left"
        spacing={6}
        pt={2}
      >
        <Button
          variant="text"
          onClick={addTransaction}
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
            onClick={() =>
              submitProposal({
                proposalData,
                nonce,
                pendingToastMessage: t('proposalCreatePendingToastMessage'),
                successToastMessage: t('proposalCreateSuccessToastMessage'),
                failedToastMessage: t('proposalCreateFailureToastMessage'),
                successCallback,
              })
            }
            disabled={isCreateDisabled}
          >
            {t('createProposal')}
          </Button>
        </Flex>
      </VStack>
    </>
  );
}

export default TransactionsAndSubmit;
