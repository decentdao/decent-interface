import { Box, Button, Text, Flex } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { useTranslation } from 'react-i18next';
import { Address, getContract } from 'viem';
import { useSignTypedData } from 'wagmi';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { buildSafeTransaction, buildSignatureBytes, EIP712_SAFE_TX_TYPE } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useSafeMultisigProposals } from '../../../hooks/DAO/loaders/governance/useSafeMultisigProposals';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useAsyncRequest } from '../../../hooks/utils/useAsyncRequest';
import useContractClient from '../../../hooks/utils/useContractClient';
import { useTransaction } from '../../../hooks/utils/useTransaction';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { MultisigProposal, FractalProposalState } from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import { ProposalCountdown } from '../../ui/proposal/ProposalCountdown';

export function TxActions({ proposal }: { proposal: MultisigProposal }) {
  const {
    node: { safe },
    guardContracts: { freezeGuardContractAddress },
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();

  const { chain } = useNetworkConfig();
  const { t } = useTranslation(['proposal', 'common', 'transaction']);

  const { walletClient } = useContractClient();
  const { signTypedDataAsync } = useSignTypedData();
  const [asyncRequest, asyncRequestPending] = useAsyncRequest();
  const [contractCall, contractCallPending] = useTransaction();
  const loadSafeMultisigProposals = useSafeMultisigProposals();
  const baseContracts = useSafeContracts();
  if (user.votingWeight === 0n) return <></>;

  const multisigTx = proposal.transaction as SafeMultisigTransactionWithTransfersResponse;

  if (!multisigTx) return null;

  const signTransaction = async () => {
    if (!walletClient || !safe?.address) {
      return;
    }
    try {
      const safeTx = buildSafeTransaction({
        ...multisigTx,
      } as any); // Have to use any because type of multisigTx based on SafeMultisigTransactionWithTransfersResponse where to is string but here we need Address type

      asyncRequest({
        asyncFunc: () =>
          signTypedDataAsync({
            domain: { verifyingContract: safe.address as Address, chainId: chain.id },
            types: EIP712_SAFE_TX_TYPE,
            primaryType: 'SafeTx',
            message: {
              ...safeTx,
            },
          }),
        failedMessage: t('failedSign'),
        pendingMessage: t('pendingSign'),
        successMessage: t('successSign'),
        successCallback: async (signature: string) => {
          await safeAPI!.confirmTransaction(proposal.proposalId, signature);
          await loadSafeMultisigProposals();
        },
      });
    } catch (e) {
      logError(e, 'Error occurred during transaction confirmation');
    }
  };

  const timelockTransaction = async () => {
    try {
      if (
        !multisigTx.confirmations ||
        !baseContracts ||
        !freezeGuardContractAddress ||
        !walletClient
      ) {
        return;
      }
      const safeTx = buildSafeTransaction({
        ...multisigTx,
      } as any);
      const signatures = buildSignatureBytes(
        multisigTx.confirmations.map(confirmation => ({
          signer: confirmation.owner as Address,
          data: confirmation.signature,
        })),
      );
      const freezeGuard = getContract({
        address: freezeGuardContractAddress,
        abi: baseContracts.multisigFreezeGuardMasterCopyContract.asPublic.abi,
        client: walletClient,
      });

      contractCall({
        contractFn: () =>
          freezeGuard.write.timelockTransaction([
            safeTx.to,
            safeTx.value,
            safeTx.data,
            safeTx.operation,
            safeTx.safeTxGas,
            safeTx.baseGas,
            safeTx.gasPrice,
            safeTx.gasToken,
            safeTx.refundReceiver,
            signatures,
            safeTx.nonce,
          ]),
        failedMessage: t('failedExecute', { ns: 'transaction' }),
        pendingMessage: t('pendingExecute', { ns: 'transaction' }),
        successMessage: t('successExecute', { ns: 'transaction' }),
        successCallback: async () => {
          await loadSafeMultisigProposals();
        },
      });
    } catch (e) {
      logError(e, 'Error occurred during transaction execution');
    }
  };

  const executeTransaction = async () => {
    try {
      if (!walletClient || !safe?.address || !multisigTx.confirmations || !baseContracts) {
        return;
      }
      const safeContract = getContract({
        address: safe.address as Address,
        abi: baseContracts.safeSingletonContract.asPublic.abi,
        client: walletClient,
      });
      const safeTx = buildSafeTransaction({
        ...multisigTx,
      } as any);
      const signatures = buildSignatureBytes(
        multisigTx.confirmations.map(confirmation => ({
          signer: confirmation.owner as Address,
          data: confirmation.signature,
        })),
      );
      contractCall({
        contractFn: () =>
          safeContract.write.execTransaction([
            safeTx.to,
            safeTx.value,
            safeTx.data,
            safeTx.operation,
            safeTx.safeTxGas,
            safeTx.baseGas,
            safeTx.gasPrice,
            safeTx.gasToken,
            safeTx.refundReceiver,
            signatures,
          ]),
        failedMessage: t('failedExecute', { ns: 'transaction' }),
        pendingMessage: t('pendingExecute', { ns: 'transaction' }),
        successMessage: t('successExecute', { ns: 'transaction' }),
        successCallback: async () => {
          await loadSafeMultisigProposals();
        },
      });
    } catch (e) {
      logError(e, 'Error occurred during transaction execution');
    }
  };

  const hasSigned = proposal.confirmations.find(confirm => confirm.owner === user.address);
  const isOwner = safe?.owners?.includes(user.address || '');
  const isPending = asyncRequestPending || contractCallPending;

  if (
    (proposal.state === FractalProposalState.ACTIVE && (hasSigned || !isOwner)) ||
    proposal.state === FractalProposalState.REJECTED ||
    proposal.state === FractalProposalState.EXECUTED ||
    proposal.state === FractalProposalState.EXPIRED
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
    [FractalProposalState.ACTIVE]: {
      action: signTransaction,
      text: 'approve',
      pageTitle: 'signTitle',
      icon: undefined,
    },
    [FractalProposalState.EXECUTABLE]: {
      action: executeTransaction,
      text: 'execute',
      pageTitle: 'executeTitle',
      icon: <Check boxSize="1.5rem" />,
    },
    [FractalProposalState.TIMELOCKABLE]: {
      action: timelockTransaction,
      text: 'timelock',
      pageTitle: 'timelockTitle',
      icon: undefined,
    },
    [FractalProposalState.TIMELOCKED]: {
      action: async () => {},
      text: 'execute',
      pageTitle: 'executeTitle',
      icon: undefined,
    },
  };
  const isButtonDisabled = isPending || proposal.state === FractalProposalState.TIMELOCKED;

  return (
    <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
      <Flex justifyContent="space-between">
        <Text textStyle="text-lg-mono-medium">{t(buttonProps[proposal.state!].pageTitle)}</Text>
        <ProposalCountdown proposal={proposal} />
      </Flex>
      <Box marginTop={4}>
        <Button
          w="full"
          rightIcon={buttonProps[proposal.state!].icon}
          isDisabled={isButtonDisabled}
          onClick={buttonProps[proposal.state!].action}
        >
          {t(buttonProps[proposal.state!].text, { ns: 'common' })}
        </Button>
      </Box>
    </ContentBox>
  );
}
