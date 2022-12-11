import { Box, Button, Text } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { Signer } from 'ethers';
import { useTranslation } from 'react-i18next';
import {
  buildSafeTransaction,
  buildSignatureBytes,
  SafeSignature,
  safeSignTypedData,
} from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { MultisigProposal, TxProposalState } from '../../../providers/Fractal/types';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import ContentBox from '../../ui/ContentBox';

export function TxActions({ proposal }: { proposal: MultisigProposal }) {
  const {
    gnosis: { safe, safeService },
  } = useFractal();
  const {
    state: { account, signerOrProvider, chainId },
  } = useWeb3Provider();
  const { t } = useTranslation('proposal');

  const isOwner = safe.owners?.includes(account || '');
  const hasSigned = proposal.confirmations.find(confirm => confirm.owner === account);
  const multisigTx = proposal.transaction as SafeMultisigTransactionWithTransfersResponse;
  const isExecuted = proposal.state === TxProposalState.Executed;

  const confirmTransaction = async () => {
    try {
      if (!safeService || !signerOrProvider || !multisigTx || !safe.address) {
        return;
      }
      const safeTx = buildSafeTransaction({
        ...multisigTx,
      });
      const gnosisContract = await GnosisSafe__factory.connect(safe.address, signerOrProvider);
      const signature: SafeSignature = await safeSignTypedData(
        signerOrProvider as Signer & TypedDataSigner,
        gnosisContract,
        safeTx,
        chainId
      );
      await safeService.confirmTransaction(proposal.proposalNumber, signature.data);
    } catch (e) {
      logError(e, 'Error occured during transaction confirmation');
    }
  };

  const executeTransaction = async () => {
    try {
      if (!safeService || !signerOrProvider || !multisigTx || !safe.address) {
        return;
      }

      if (!multisigTx.confirmations) {
        console.log("this shouldn't ever be the case");
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
      await gnosisContract.execTransaction(
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
      );
    } catch (e) {
      logError(e, 'Error occured during transaction execution');
    }
  };

  if (isExecuted) {
    return null;
  }
  const hasReachedThreshold = proposal.confirmations.length >= (safe.threshold || 0);
  const isExecutable = hasReachedThreshold && proposal.state === TxProposalState.Pending;
  const pageTitle = isExecutable ? t('executeTitle') : t('signTitle');

  const buttonText = isExecutable ? t('execute') : t('approve');
  const buttonAction = isExecutable ? executeTransaction : confirmTransaction;
  const buttonIcon = isExecutable ? undefined : <Check boxSize="1.5rem" />;
  const isButtonActive = isOwner && (!hasSigned || hasReachedThreshold);
  return (
    <ContentBox bg="black.900-semi-transparent">
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
