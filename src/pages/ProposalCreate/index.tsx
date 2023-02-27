import { Text, Grid, GridItem, Box, Flex, Center } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProposalDetails } from '../../components/ProposalCreate/ProposalDetails';
import { ProposalHeader } from '../../components/ProposalCreate/ProposalHeader';
import TransactionsAndSubmit from '../../components/ProposalCreate/TransactionsAndSubmit';
import UsulMetadata from '../../components/ProposalCreate/UsulMetadata';
import { BarLoader } from '../../components/ui/loaders/BarLoader';
import PageHeader from '../../components/ui/page/Header/PageHeader';
import { BACKGROUND_SEMI_TRANSPARENT, HEADER_HEIGHT } from '../../constants/common';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { BASE_ROUTES, DAO_ROUTES } from '../../routes/constants';
import { ProposalExecuteData } from '../../types/proposal';
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

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
"details"`;

function ProposalCreate() {
  const {
    gnosis: { safe },
    governance: { type },
  } = useFractal();
  const { t } = useTranslation(['proposal', 'common', 'breadcrumbs']);

  const [proposalDescription, setProposalDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionData[]>([
    Object.assign({}, defaultTransaction),
  ]);
  const [proposalData, setProposalData] = useState<ProposalExecuteData>();
  const [nonce, setNonce] = useState<number>();
  const navigate = useNavigate();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const [showTransactionsAndSubmit, setShowTransactionsAndSubmit] = useState<boolean>();
  const [inputtedMetadata, setInputtedMetadata] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<{
    title: string;
    description: string;
    documentationUrl: string;
  }>({ title: '', description: '', documentationUrl: '' });

  useEffect(() => {
    if (!type) return;
    setShowTransactionsAndSubmit(type !== GovernanceTypes.GNOSIS_SAFE_USUL || inputtedMetadata);
  }, [inputtedMetadata, type]);

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
      values: transactions.map(transaction => transaction.ethValue.bigNumberValue!),
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

  if (!type) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('proposals', { ns: 'breadcrumbs' }),
            path: DAO_ROUTES.proposals.relative(safe.address),
          },
          {
            title: t('proposalNew', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
        ButtonIcon={Trash}
        buttonVariant="secondary"
        buttonClick={() =>
          navigate(safe.address ? DAO_ROUTES.dao.relative(safe.address) : BASE_ROUTES.landing)
        }
        isButtonDisabled={pendingCreateTx}
      />
      <Text
        textStyle="text-2xl-mono-regular"
        color="grayscale.100"
      >
        {t('createProposal')}
      </Text>
      <Grid
        mt={8}
        gap={4}
        templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
        gridTemplateRows={'5.1em 1fr'}
        templateAreas={{
          base: templateAreaSingleCol,
          lg: templateAreaTwoCol,
        }}
      >
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
              <ProposalHeader
                isUsul={type === GovernanceTypes.GNOSIS_SAFE_USUL}
                inputtedMetadata={inputtedMetadata}
                metadataTitle={metadata.title}
                nonce={nonce}
                setNonce={setNonce}
              />
              <UsulMetadata
                show={!showTransactionsAndSubmit}
                setInputtedMetadata={setInputtedMetadata}
                metadata={metadata}
                setMetadata={setMetadata}
              />
              <TransactionsAndSubmit
                show={showTransactionsAndSubmit}
                showBackButton={!!inputtedMetadata}
                onGoBack={() => setInputtedMetadata(false)}
                addTransaction={addTransaction}
                pendingCreateTx={pendingCreateTx}
                submitProposal={submitProposal}
                proposalData={proposalData}
                nonce={nonce}
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
