import {
  AllTransactionsListResponse,
  SafeInfoResponse,
  SafeMultisigTransactionWithTransfersResponse,
  EthereumTxWithTransfersResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { ActivityEventType, Activity } from '../../providers/Fractal/types';
import { parseDecodedData, totalsReducer } from '../../providers/Fractal/utils';
import { formatWeiToValue } from '../../utils';

export function useParseSafeTxs(
  transactions: AllTransactionsListResponse,
  safe: Partial<SafeInfoResponse>
) {
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
      const transferAmountTotalsMap = transaction.transfers.reduce(totalsReducer, new Map());

      // formats totals array into readable string with Symbol ie 1 ETHER
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
        transferAmountTotals.push(`${formatWeiToValue(multiSigTransaction.value, 18)} ETHER`);
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
  }, [safe.address, transactions]);

  return parsedActivities;
}
