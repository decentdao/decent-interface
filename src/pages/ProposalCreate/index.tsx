import { Button, Text, Grid, GridItem, VStack, Box, Flex } from '@chakra-ui/react';
import { CloseX } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProposalDetails } from '../../components/ProposalCreate/ProposalDetails';
import TransactionsAndSubmit from '../../components/ProposalCreate/TransactionsAndSubmit';
import UsulMetadata from '../../components/ProposalCreate/UsulMetadata';
import PageHeader from '../../components/ui/Header/PageHeader';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import useUsul from '../../hooks/DAO/proposal/useUsul';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { ProposalExecuteData } from '../../types/proposal';
import { TransactionData } from '../../types/transaction';
import { notProd, useProposeStuff } from '../../utils/dev';

const defaultTransaction = {
  targetAddress: '',
  ethValue: { value: '0', bigNumberValue: BigNumber.from('0') },
  functionName: '',
  functionSignature: '',
  parameters: '',
  isExpanded: true,
  encodedFunctionData: undefined,
};

const templateAreaTwoCol = `"header header"
"content details"`;
const templateAreaSingleCol = `"header"
"content"
"details"`;

function ProposalCreate() {
  const {
    gnosis: { safe, daoName },
  } = useFractal();
  const { t } = useTranslation(['proposal', 'common']);
  const { usulContract } = useUsul();
  const [isUsul, setIsUsul] = useState<boolean>();

  const [proposalDescription, setProposalDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionData[]>([
    Object.assign({}, defaultTransaction),
  ]);
  const [proposalData, setProposalData] = useState<ProposalExecuteData>();
  const navigate = useNavigate();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const testPropose = useProposeStuff(setTransactions);
  const [showTransactionsAndSubmit, setShowTransactionsAndSubmit] = useState<boolean>();
  const [inputtedMetadata, setInputtedMetadata] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<{
    title: string;
    description: string;
    documentationUrl: string;
  }>({ title: '', description: '', documentationUrl: '' });

  useEffect(() => {
    setIsUsul(!!usulContract);
  }, [usulContract]);

  useEffect(() => {
    if (isUsul === undefined) return;
    setShowTransactionsAndSubmit(!isUsul || inputtedMetadata);
  }, [inputtedMetadata, isUsul]);

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
    let hasError = false;
    transactions.forEach(transaction => {
      if (transaction.addressError || transaction.fragmentError) {
        hasError = true;
      }
    });
    if (hasError) {
      return;
    }
    const proposal = {
      targets: transactions.map(transaction => transaction.targetAddress),
      values: transactions.map(transaction => transaction.ethValue.bigNumberValue),
      calldatas: transactions.map(transaction => transaction.encodedFunctionData || ''),
      title: metadata.title,
      description: metadata.description,
      documentationUrl: metadata.documentationUrl,
    };
    setProposalData(proposal);
  }, [
    transactions,
    proposalDescription,
    metadata.title,
    metadata.description,
    metadata.documentationUrl,
  ]);

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
    <Box>
      <PageHeader
        title={t('pageTitle', { daoName })}
        titleTestId={'title-proposal-details'}
      >
        <Button
          paddingLeft={0}
          width="fit-content"
          variant="text"
          leftIcon={<CloseX />}
          onClick={() =>
            safe.address ? navigate(`/daos/${safe.address}/proposals`) : navigate('/daos/')
          }
          disabled={pendingCreateTx}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
      </PageHeader>
      <Grid
        gap={4}
        templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
        gridTemplateRows={'5.1em 1fr'}
        templateAreas={{
          base: templateAreaSingleCol,
          lg: templateAreaTwoCol,
        }}
      >
        <GridItem area="header">
          {inputtedMetadata && (
            <Text
              textStyle="text-md-mono-regular"
              color="gold.500"
              cursor="pointer"
              onClick={() => setInputtedMetadata(false)}
              mb={4}
            >
              {`< ${t('proposalBack')}`}
            </Text>
          )}
          <VStack align="left">
            <Text
              onClick={notProd() ? testPropose : undefined}
              textStyle="text-2xl-mono-regular"
            >
              {t('createProposal')}
            </Text>
          </VStack>
        </GridItem>
        <GridItem area="content">
          <Flex
            flexDirection="column"
            align="left"
          >
            <Box
              rounded="lg"
              p="1rem"
              bg={BACKGROUND_SEMI_TRANSPARENT}
            >
              {inputtedMetadata && metadata.title && (
                <Text
                  textStyle="text-xl-mono-medium"
                  mb={4}
                >
                  {metadata.title}
                </Text>
              )}
              <UsulMetadata
                show={!showTransactionsAndSubmit}
                setInputtedMetadata={setInputtedMetadata}
                metadata={metadata}
                setMetadata={setMetadata}
              />
              <TransactionsAndSubmit
                show={showTransactionsAndSubmit}
                addTransaction={addTransaction}
                pendingCreateTx={pendingCreateTx}
                submitProposal={submitProposal}
                proposalData={proposalData}
                successCallback={successCallback}
                isCreateDisabled={isCreateDisabled}
                transactions={transactions}
                setTransactions={setTransactions}
                removeTransaction={removeTransaction}
              />
            </Box>
          </Flex>
        </GridItem>
        <GridItem area="details">
          <ProposalDetails />
        </GridItem>
      </Grid>
    </Box>
  );
}

export default ProposalCreate;
