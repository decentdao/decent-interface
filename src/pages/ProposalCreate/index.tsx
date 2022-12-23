import {
  Button,
  Text,
  Grid,
  GridItem,
  VStack,
  Divider,
  Alert,
  AlertTitle,
  Box,
} from '@chakra-ui/react';
import { CloseX, Info } from '@decent-org/fractal-ui';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProposalDetails } from '../../components/ProposalCreate/ProposalDetails';
import Transactions from '../../components/ProposalCreate/Transactions';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { logError } from '../../helpers/errorLogging';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { ProposalExecuteData } from '../../types/proposal';
import { TransactionData } from '../../types/transaction';
import { notProd, useProposeStuff } from '../../utils/dev';

const defaultTransaction = {
  targetAddress: '',
  functionName: '',
  functionSignature: '',
  parameters: '',
  isExpanded: true,
};

function ProposalCreate() {
  const {
    gnosis: { safe },
  } = useFractal();
  const { t } = useTranslation(['proposal', 'common']);

  const [proposalDescription, setProposalDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionData[]>([
    Object.assign({}, defaultTransaction),
  ]);
  const [proposalData, setProposalData] = useState<ProposalExecuteData>();
  const navigate = useNavigate();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const testPropose = useProposeStuff(setTransactions);

  /**
   * adds new transaction form
   */
  const addTransaction = () => {
    const newTransactionData = Object.assign({}, defaultTransaction);
    transactions[transactions.length - 1].isExpanded = false; // this makes sure the previous transaction is colapsed when adding a new transaction
    setTransactions([...transactions, newTransactionData]);
  };

  const removeTransaction = (transactionNumber: number) => {
    const filteredTransactions = transactions.filter((_, i) => i !== transactionNumber);
    setTransactions(filteredTransactions);
  };

  const successCallback = () => {
    setProposalDescription('');
    setTransactions([]);
    setProposalData(undefined);

    if (safe) {
      navigate(`/daos/${safe.address}/proposals`);
    }
  };

  useEffect(() => {
    try {
      let hasError: boolean = false;
      transactions.forEach((transaction: TransactionData) => {
        if (transaction.addressError || transaction.fragmentError) {
          hasError = true;
        }
      });
      if (hasError) {
        return;
      }
      const proposal = {
        targets: transactions.map(transaction => transaction.targetAddress),
        values: transactions.map(() => BigNumber.from('0')),
        calldatas: transactions.map(transaction => {
          if (transaction.functionName) {
            const funcSignature = `function ${transaction.functionName}(${transaction.functionSignature})`;
            const parametersArr = `[${transaction.parameters}]`;
            return new ethers.utils.Interface([funcSignature]).encodeFunctionData(
              transaction.functionName,
              JSON.parse(parametersArr)
            );
          }
          return '';
        }),
        title: '',
        description: proposalDescription,
        documentationUrl: '',
      };
      setProposalData(proposal);
    } catch (e) {
      logError(e);
      // catches errors related to `ethers.utils.Interface` and the `encodeFunctionData`
      // these errors are handled in the onChange of the inputs in transactions
    }
  }, [transactions, proposalDescription]);

  const isValidProposal = useMemo(() => {
    // if proposalData doesn't exist
    if (!proposalData) {
      return false;
    }

    // if no target has been input OR no calldata (function name required)
    if (!proposalData.targets[0] || !proposalData.calldatas[0]) {
      return false;
    }

    // if error in transactions
    const hasError = transactions.some(
      (transaction: TransactionData) => transaction.addressError || transaction.fragmentError
    );
    if (hasError) {
      return false;
    }
    // proposal data has length of 1 for each data set
    let hasProposalData: boolean = !!proposalData.calldatas.length && !!proposalData.targets.length;
    if (!hasProposalData) {
      return false;
    }
    // validations pass
    return true;
  }, [proposalData, transactions]);

  const isCreateDisabled = useMemo(() => {
    return !canUserCreateProposal || !isValidProposal || pendingCreateTx;
  }, [pendingCreateTx, isValidProposal, canUserCreateProposal]);

  return (
    <Grid
      gap={4}
      templateColumns="2fr 1fr"
      templateAreas={`"header header"
                      "content details"`}
    >
      <GridItem area="header">
        <VStack align="left">
          <Button
            paddingLeft={0}
            width="fit-content"
            variant="text"
            leftIcon={<CloseX />}
            onClick={() =>
              safe.address ? navigate(`/daos/${safe.address}/proposals`) : navigate('/daos/')
            }
          >
            {t('cancel', { ns: 'common' })}
          </Button>
          <Text
            onClick={notProd() ? testPropose : undefined}
            textStyle="text-2xl-mono-regular"
          >
            {t('createProposal')}
          </Text>
        </VStack>
      </GridItem>
      <GridItem area="content">
        <VStack
          align="left"
          spacing={6}
        >
          <Box
            rounded="lg"
            p="1rem"
            bg={BACKGROUND_SEMI_TRANSPARENT}
          >
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
              <Alert status="info">
                <Info boxSize="24px" />
                <AlertTitle>{t('transactionExecutionAlertMessage')}</AlertTitle>
              </Alert>
              <Divider color="chocolate.700" />
              <Button
                w="100%"
                onClick={() =>
                  submitProposal({
                    proposalData,
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
            </VStack>
          </Box>
        </VStack>
      </GridItem>
      <GridItem area="details">
        <ProposalDetails />
      </GridItem>
    </Grid>
  );
}

export default ProposalCreate;
