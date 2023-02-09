import {
  AllTransactionsListResponse,
  SafeInfoResponse,
  SafeMultisigTransactionWithTransfersResponse,
  EthereumTxWithTransfersResponse,
  TransferWithTokenInfoResponse,
} from '@safe-global/safe-service-client';
import { BigNumber, constants } from 'ethers';
import { useMemo } from 'react';
import {
  ActivityEventType,
  Activity,
  AssetTotals,
  GnosisTransferType,
} from '../../providers/Fractal/types';
import { parseDecodedData } from '../../providers/Fractal/utils';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { formatWeiToValue } from '../../utils';

export function useParseSafeTxs(
  transactions: AllTransactionsListResponse,
  safe: Partial<SafeInfoResponse>
) {
  const { nativeTokenSymbol } = useNetworkConfg();
  const parsedActivities = useMemo(() => {
    if (!transactions.results.length || !safe.address) {
      return [];
    }

    return transactions.results.map((transaction, _, transactionArr) => {
      const isMultiSigTransaction = transaction.txType === 'MULTISIG_TRANSACTION';
      const isModuleTransaction = transaction.txType === 'MODULE_TRANSACTION';
      const multiSigTransaction = transaction as SafeMultisigTransactionWithTransfersResponse;
      const ethereumTransaction = transaction as EthereumTxWithTransfersResponse;

      // @note for ethereum transactions event these are the execution date
      const eventDate = new Date(
        multiSigTransaction.submissionDate || ethereumTransaction.executionDate
      );

      // @note it can be assumed that if there is no transfers it a receiving event
      const isDeposit: boolean = transaction.transfers.length
        ? transaction.transfers.every(t => t.to.toLowerCase() === safe.address!.toLowerCase())
        : false;

      // returns mapping of Asset -> Asset Total Value by getting the total of each asset transfered
      const transferAmountTotalsMap = transaction.transfers.reduce(
        (prev: Map<string, AssetTotals>, cur: TransferWithTokenInfoResponse) => {
          if (cur.type === GnosisTransferType.ETHER && cur.value) {
            const prevValue = prev.get(constants.AddressZero)!;
            if (prevValue) {
              prev.set(constants.AddressZero, {
                bn: prevValue.bn.add(BigNumber.from(cur.value)),
                symbol: nativeTokenSymbol,
                decimals: 18,
              });
            }
            prev.set(constants.AddressZero, {
              bn: BigNumber.from(cur.value),
              symbol: nativeTokenSymbol,
              decimals: 18,
            });
          }
          if (cur.type === GnosisTransferType.ERC721 && cur.tokenInfo && cur.tokenId) {
            prev.set(`${cur.tokenAddress}:${cur.tokenId}`, {
              bn: BigNumber.from(1),
              symbol: cur.tokenInfo.symbol,
              decimals: 0,
            });
          }
          if (cur.type === GnosisTransferType.ERC20 && cur.value && cur.tokenInfo) {
            const prevValue = prev.get(cur.tokenInfo.address);
            if (prevValue) {
              prev.set(cur.tokenInfo.address, {
                ...prevValue,
                bn: prevValue.bn.add(BigNumber.from(cur.value)),
              });
            } else {
              prev.set(cur.tokenAddress!, {
                bn: BigNumber.from(cur.value),
                symbol: cur.tokenInfo.symbol,
                decimals: cur.tokenInfo.decimals,
              });
            }
          }

          return prev;
        },
        new Map()
      );

      // formats totals array into readable string with Symbol ie 1 [NativeSymbol]
      const transferAmountTotals: string[] = Array.from(transferAmountTotalsMap.values()).map(
        token => {
          const totalAmount = formatWeiToValue(token.bn, token.decimals);
          const symbol = token.symbol;
          return `${totalAmount} ${symbol}`;
        }
      );

      // maps address for each transfer
      const transferAddresses = transaction.transfers.map(transfer =>
        transfer.to.toLowerCase() === safe.address!.toLowerCase() ? transfer.from : transfer.to
      );

      // @note this indentifies transaction a simple ETH transfer
      const isEthSend =
        isMultiSigTransaction &&
        !multiSigTransaction.data &&
        !multiSigTransaction.isExecuted &&
        !BigNumber.from(multiSigTransaction.value).isZero();

      if (isEthSend) {
        transferAmountTotals.push(
          `${formatWeiToValue(multiSigTransaction.value, 18)} ${nativeTokenSymbol}`
        );
        transferAddresses.push(multiSigTransaction.to);
      }

      const eventSafeTxHash = multiSigTransaction.safeTxHash;

      const eventType: any = isMultiSigTransaction
        ? ActivityEventType.Governance
        : isModuleTransaction
        ? ActivityEventType.Module
        : ActivityEventType.Treasury;

      const eventNonce = multiSigTransaction.nonce;

      // @note identifies transactions with same nonce. this can be used to identify rejected transactions
      const noncePair = transactionArr.find(tx => {
        const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
        return (
          multiSigTx.nonce === eventNonce &&
          multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash
        );
      });

      const isMultisigRejectionTx: boolean | undefined =
        isMultiSigTransaction &&
        !multiSigTransaction.data &&
        multiSigTransaction.to === multiSigTransaction.safe &&
        noncePair &&
        BigNumber.from(multiSigTransaction.value).isZero();

      const confirmations = multiSigTransaction.confirmations
        ? multiSigTransaction.confirmations
        : [];

      const metaData =
        (isMultiSigTransaction || isModuleTransaction) && multiSigTransaction.dataDecoded
          ? {
              decodedTransactions: parseDecodedData(
                multiSigTransaction,
                isMultiSigTransaction || isModuleTransaction
              ),
            }
          : undefined;

      const targets = metaData
        ? [...metaData.decodedTransactions.map(tx => tx.target)]
        : [transaction.to];

      const activity: Activity = {
        transaction,
        transferAddresses,
        transferAmountTotals,
        isDeposit,
        eventDate,
        eventType,
        confirmations,
        signersThreshold: multiSigTransaction.confirmationsRequired,
        multisigRejectedProposalNumber:
          isMultisigRejectionTx && !!noncePair
            ? (noncePair as SafeMultisigTransactionWithTransfersResponse).safeTxHash
            : undefined,
        proposalNumber: eventSafeTxHash,
        targets,
        transactionHash: multiSigTransaction.transactionHash,
        metaData,
        state: null,
        nonce: eventNonce,
      };
      return activity;
    });
  }, [safe.address, transactions, nativeTokenSymbol]);

  return parsedActivities;
}
