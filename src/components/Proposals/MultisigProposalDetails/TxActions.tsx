import { Box, Button, Text } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { GnosisSafe__factory, VetoGuard } from '@fractal-framework/fractal-contracts';
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

export function TxActions({
  proposal,
  vetoGuard,
}: {
  proposal: MultisigProposal;
  vetoGuard: VetoGuard;
}) {
  const {
    gnosis: { safe, safeService },
    actions: { refreshGnosisTransactions },
  } = useFractal();
  const {
    state: { account, signerOrProvider, chainId },
  } = useWeb3Provider();
  const { t } = useTranslation(['proposal', 'common', 'transaction']);

  const [asyncRequest, asyncRequestPending] = useAsyncRequest();
  const [contractCall, contractCallPending] = useTransaction();

  const multisigTx = proposal.transaction as SafeMultisigTransactionWithTransfersResponse;

  if (!multisigTx) return null;

  const signTransaction = async () => {
    if (!safeService || !signerOrProvider || !safe.address) {
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
          setTimeout(() => Promise.resolve(refreshGnosisTransactions()), 500);
        },
      });
    } catch (e) {
      logError(e, 'Error occured during transaction confirmation');
    }
  };

  const queueTransaction = async () => {
    try {
      if (!multisigTx.confirmations) {
        return;
      }
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
          vetoGuard.queueTransaction(
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
          setTimeout(() => Promise.resolve(refreshGnosisTransactions()), 1000);
        },
      });
    } catch (e) {
      logError(e, 'Error occured during transaction execution');
    }
  };

  const executeTransaction = async () => {
    try {
      if (!signerOrProvider || !safe.address || !multisigTx.confirmations) {
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
          setTimeout(() => Promise.resolve(refreshGnosisTransactions()), 1000);
        },
      });
    } catch (e) {
      logError(e, 'Error occured during transaction execution');
    }
  };

  const hasSigned = proposal.confirmations.find(confirm => confirm.owner === account);
  const isOwner = safe.owners?.includes(account || '');
  const isPending = asyncRequestPending || contractCallPending;

  if (
    (proposal.state === TxProposalState.Active && (hasSigned || !isOwner)) ||
    proposal.state === TxProposalState.Rejected ||
    proposal.state === TxProposalState.Executed ||
    proposal.state === TxProposalState.Expired
  ) {
    return null;
  }

  type ButtonProps = {
    [state: string]: {
      action: () => Promise<any>;
      text: string;
      pageTitle: string;
      icon: undefined | JSX.Element;
    };
  };

  const buttonProps: ButtonProps = {
    [TxProposalState.Active]: {
      action: signTransaction,
      text: 'approve',
      pageTitle: 'signTitle',
      icon: undefined,
    },
    [TxProposalState.Executing]: {
      action: executeTransaction,
      text: 'execute',
      pageTitle: 'executeTitle',
      icon: <Check boxSize="1.5rem" />,
    },
    [TxProposalState.Queueable]: {
      action: queueTransaction,
      text: 'queue',
      pageTitle: 'queueTitle',
      icon: undefined,
    },
    [TxProposalState.Queued]: {
      action: async () => {},
      text: 'execute',
      pageTitle: 'executeTitle',
      icon: undefined,
    },
  };

  const isButtonDisabled = isPending || proposal.state === TxProposalState.Queued;

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Text textStyle="text-lg-mono-medium">{t(buttonProps[proposal.state!].pageTitle)}</Text>
      <Box marginTop={4}>
        <Button
          w="full"
          rightIcon={buttonProps[proposal.state!].icon}
          disabled={isButtonDisabled}
          onClick={buttonProps[proposal.state!].action}
        >
          {t(buttonProps[proposal.state!].text, { ns: 'common' })}
        </Button>
      </Box>
    </ContentBox>
  );
}
