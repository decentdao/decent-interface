import { Box, Button, Text, Flex, Tooltip } from '@chakra-ui/react';
import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/api-kit';
import { Signer } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hex, getAddress, isHex } from 'viem';
import { Check } from '../../../assets/theme/custom/icons/Check';
import { GnosisSafeL2__factory } from '../../../assets/typechain-types/usul/factories/@gnosis.pm/safe-contracts/contracts';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { buildSafeTransaction, buildSignatureBytes, EIP712_SAFE_TX_TYPE } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useSafeMultisigProposals } from '../../../hooks/DAO/loaders/governance/useSafeMultisigProposals';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useAsyncRequest } from '../../../hooks/utils/useAsyncRequest';
import useSignerOrProvider from '../../../hooks/utils/useSignerOrProvider';
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
  const signerOrProvider = useSignerOrProvider();
  const safeAPI = useSafeAPI();

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const wasTimelocked = useRef(
    proposal.state === FractalProposalState.TIMELOCKABLE ||
      proposal.state === FractalProposalState.TIMELOCKED,
  );

  useEffect(() => {
    if (wasTimelocked.current && proposal.state === FractalProposalState.EXECUTABLE) {
      setIsSubmitDisabled(false);
    }
  }, [proposal.state]);

  const { chain } = useNetworkConfig();
  const { t } = useTranslation(['proposal', 'common', 'transaction']);

  const [asyncRequest, asyncRequestPending] = useAsyncRequest();
  const [contractCall, contractCallPending] = useTransaction();
  const { loadSafeMultisigProposals } = useSafeMultisigProposals();
  const baseContracts = useSafeContracts();
  if (user.votingWeight === 0n) return <></>;

  const multisigTx = proposal.transaction as SafeMultisigTransactionWithTransfersResponse;

  if (!multisigTx) return null;

  const signTransaction = async () => {
    if (
      !signerOrProvider ||
      !safe?.address ||
      (multisigTx.data && !isHex(multisigTx.data)) ||
      !safeAPI
    ) {
      return;
    }
    try {
      const safeTx = buildSafeTransaction({
        ...multisigTx,
        to: getAddress(multisigTx.to),
        value: BigInt(multisigTx.value),
        data: multisigTx.data as Hex | undefined,
        operation: multisigTx.operation as 0 | 1,
      });

      asyncRequest({
        asyncFunc: () =>
          (signerOrProvider as Signer & TypedDataSigner)._signTypedData(
            { verifyingContract: safe.address, chainId: chain.id },
            EIP712_SAFE_TX_TYPE,
            safeTx,
          ),
        failedMessage: t('failedSign'),
        pendingMessage: t('pendingSign'),
        successMessage: t('successSign'),
        successCallback: async (signature: string) => {
          await safeAPI.confirmTransaction(proposal.proposalId, signature);
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
        (multisigTx.data && !isHex(multisigTx.data))
      ) {
        return;
      }
      const safeTx = buildSafeTransaction({
        ...multisigTx,
        to: getAddress(multisigTx.to),
        value: BigInt(multisigTx.value),
        data: multisigTx.data as Hex | undefined,
        operation: multisigTx.operation as 0 | 1,
      });
      const signatures = buildSignatureBytes(
        multisigTx.confirmations.map(confirmation => {
          if (!isHex(confirmation.signature)) {
            throw new Error('Confirmation signature is malfunctioned');
          }
          return {
            signer: confirmation.owner,
            data: confirmation.signature,
          };
        }),
      );
      const freezeGuard = baseContracts.multisigFreezeGuardMasterCopyContract.asSigner.attach(
        freezeGuardContractAddress,
      );
      contractCall({
        contractFn: () =>
          freezeGuard.timelockTransaction(
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
          ),
        failedMessage: t('failedExecute', { ns: 'transaction' }),
        pendingMessage: t('pendingExecute', { ns: 'transaction' }),
        successMessage: t('successExecute', { ns: 'transaction' }),
        successCallback: async () => {
          setIsSubmitDisabled(true);
          await loadSafeMultisigProposals();
        },
      });
    } catch (e) {
      logError(e, 'Error occurred during transaction execution');
    }
  };

  const executeTransaction = async () => {
    try {
      if (
        !signerOrProvider ||
        !safe?.address ||
        !multisigTx.confirmations ||
        (multisigTx.data && !isHex(multisigTx.data))
      ) {
        return;
      }
      const safeContract = GnosisSafeL2__factory.connect(safe.address, signerOrProvider);

      const safeTx = buildSafeTransaction({
        ...multisigTx,
        to: getAddress(multisigTx.to),
        value: BigInt(multisigTx.value),
        data: multisigTx.data as Hex | undefined,
        operation: multisigTx.operation as 0 | 1,
      });

      const signatures = buildSignatureBytes(
        multisigTx.confirmations.map(confirmation => {
          if (!isHex(confirmation.signature)) {
            throw new Error('Confirmation signature is malfunctioned');
          }
          return {
            signer: confirmation.owner,
            data: confirmation.signature,
          };
        }),
      );

      contractCall({
        contractFn: () =>
          safeContract.execTransaction(
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
          ),
        failedMessage: t('failedExecute', { ns: 'transaction' }),
        pendingMessage: t('pendingExecute', { ns: 'transaction' }),
        successMessage: t('successExecute', { ns: 'transaction' }),
        successCallback: async () => {
          setIsSubmitDisabled(true);
          await loadSafeMultisigProposals();
        },
      });
    } catch (e) {
      logError(e, 'Error occurred during transaction execution');
    }
  };

  const hasSigned = !!proposal.confirmations?.find(confirm => confirm.owner === user.address);
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
      icon?: JSX.Element;
    };
  };

  const buttonProps: ButtonProps = {
    [FractalProposalState.ACTIVE]: {
      action: signTransaction,
      text: 'approve',
      pageTitle: 'signTitle',
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
    },
    [FractalProposalState.TIMELOCKED]: {
      action: async () => {},
      text: 'execute',
      pageTitle: 'executeTitle',
    },
  };
  const isActiveNonce = !!safe && multisigTx.nonce === safe.nonce;
  const isButtonDisabled =
    isSubmitDisabled ||
    isPending ||
    proposal.state === FractalProposalState.TIMELOCKED ||
    !isActiveNonce;

  return (
    <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
      <Flex justifyContent="space-between">
        <Text>{t(buttonProps[proposal.state!].pageTitle)}</Text>
        <ProposalCountdown proposal={proposal} />
      </Flex>
      <Box marginTop={4}>
        <Tooltip
          placement="top-start"
          label={t('notActiveNonceTooltip')}
          isDisabled={isActiveNonce}
        >
          <Button
            w="full"
            rightIcon={buttonProps[proposal.state!].icon}
            isDisabled={isButtonDisabled}
            onClick={buttonProps[proposal.state!].action}
          >
            {t(buttonProps[proposal.state!].text, { ns: 'common' })}
          </Button>
        </Tooltip>
      </Box>
    </ContentBox>
  );
}
