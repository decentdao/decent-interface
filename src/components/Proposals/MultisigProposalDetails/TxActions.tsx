import { Box, Button, Text } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { Signer } from 'ethers';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { buildSafeTransaction, buildSignatureBytes, EIP712_SAFE_TX_TYPE } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useAsyncRequest } from '../../../hooks/utils/useAsyncRequest';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { MultisigProposal, TxProposalState } from '../../../providers/Fractal/types';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import { useTransaction } from '../../../providers/Web3Data/transactions';
import ContentBox from '../../ui/ContentBox';

export function TxActions({ proposal }: { proposal: MultisigProposal }) {
  const {
    gnosis: { safe, safeService },
    actions: { getGnosisSafeTransactions },
  } = useFractal();
  const {
    state: { account, signerOrProvider, chainId },
  } = useWeb3Provider();
  const { t } = useTranslation(['proposal', 'common', 'transaction']);

  const [asyncRequest, asyncRequestPending] = useAsyncRequest();
  const [contractCall, contractCallPending] = useTransaction();
  const hasActions =
    proposal.state === TxProposalState.Active ||
    proposal.state === TxProposalState.Approved ||
    proposal.state === TxProposalState.Queued;
  const multisigTx = proposal.transaction as SafeMultisigTransactionWithTransfersResponse;

  const confirmTransaction = async () => {
    if (!safeService || !signerOrProvider || !multisigTx || !safe.address) {
      return;
    }
    try {
      const safeTx = buildSafeTransaction({
        ...multisigTx,
      });

      asyncRequest({
        asyncFunc: () =>
          (signerOrProvider as Signer & TypedDataSigner)._signTypedData(
            { verifyingContract: safe.address, chainId },
            EIP712_SAFE_TX_TYPE,
            safeTx
          ),
        failedMessage: t('failedSign'),
        pendingMessage: t('pendingSign'),
        successMessage: t('successSign'),
        successCallback: async (signature: string) => {
          await safeService.confirmTransaction(proposal.proposalNumber, signature);
          setTimeout(() => Promise.resolve(getGnosisSafeTransactions()), 500);
        },
      });
    } catch (e) {
      logError(e, 'Error occured during transaction confirmation');
    }
  };

  const executeTransaction = async () => {
    try {
      if (
        !safeService ||
        !signerOrProvider ||
        !multisigTx ||
        !safe.address ||
        !multisigTx.confirmations
      ) {
        return;
      }
      const gnosisContract = GnosisSafe__factory.connect(safe.address, signerOrProvider);
      const safeTx = buildSafeTransaction({
        ...multisigTx,
      });
      const signatures = buildSignatureBytes(
        multisigTx.confirmations.map(confirmation => ({
          signer: confirmation.owner,
          data: confirmation.signature,
        }))
      );
      contractCall({
        contractFn: () =>
          gnosisContract.execTransaction(
            safeTx.to,
            safeTx.value,
            safeTx.data,
            safeTx.operation,
            safeTx.safeTxGas,
            safeTx.baseGas,
            safeTx.gasPrice,
            safeTx.gasToken,
            safeTx.refundReceiver,
            signatures
          ),
        failedMessage: t('failedExecute', { ns: 'transaction' }),
        pendingMessage: t('pendingExecute', { ns: 'transaction' }),
        successMessage: t('successExecute', { ns: 'transaction' }),
        successCallback: async () => {
          setTimeout(() => Promise.resolve(getGnosisSafeTransactions()), 1000);
        },
      });
    } catch (e) {
      logError(e, 'Error occured during transaction execution');
    }
  };

  if (!hasActions) {
    return null;
  }

  const hasSigned = proposal.confirmations.find(confirm => confirm.owner === account);
  const hasReachedThreshold = proposal.confirmations.length >= (safe.threshold || 1);

  const isOwner = safe.owners?.includes(account || '');
  const isPending = asyncRequestPending || contractCallPending;
  const isExecutable =
    hasReachedThreshold && hasSigned && proposal.state === TxProposalState.Queued;

  const pageTitle = isExecutable ? t('executeTitle') : t('signTitle');

  const buttonText = t(isExecutable ? 'execute' : 'approve', { ns: 'common' });
  const buttonAction = isExecutable ? executeTransaction : confirmTransaction;
  const buttonIcon = isExecutable ? undefined : <Check boxSize="1.5rem" />;
  const isButtonActive = isOwner && !isPending;

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Text textStyle="text-lg-mono-medium">{pageTitle}</Text>
      <Box marginTop={4}>
        <Button
          w="full"
          rightIcon={buttonIcon}
          disabled={!isButtonActive}
          onClick={buttonAction}
        >
          {buttonText}
        </Button>
      </Box>
    </ContentBox>
  );
}
