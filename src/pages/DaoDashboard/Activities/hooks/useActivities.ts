import {
  EthereumTxWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@gnosis.pm/safe-service-client';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../../../providers/Fractal/types';
import { totalsReducer } from '../../../../providers/Fractal/utils';
import { SortBy } from '../../../../types';
import { formatWeiToValue } from '../../../../utils';
import { DEFAULT_DATE_FORMAT } from '../../../../utils/numberFormats';
import {
  TxProposalState,
  Activity,
  ActivityEventType,
} from './../../../../providers/Fractal/governance/types';

export const useActivities = (sortBy: SortBy) => {
  const {
    gnosis: { safe, transactions },
    governance: {
      type,
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const [isActivitiesLoading, setActivitiesLoading] = useState<boolean>(true);

  const parsedActivities = useMemo(() => {
    if (!transactions.results.length || !safe) {
      return [];
    }
    return transactions.results.map((transaction, i, transactionArr) => {
      const isMultiSigTransaction = transaction.txType === 'MULTISIG_TRANSACTION';
      const multiSigTransaction = transaction as SafeMultisigTransactionWithTransfersResponse;
      const ethereumTransaction = transaction as EthereumTxWithTransfersResponse;

      // @note for ethereum transactions event these are the execution date
      const eventDate = format(
        new Date(multiSigTransaction.submissionDate || ethereumTransaction.executionDate),
        DEFAULT_DATE_FORMAT
      );

      const isDeposit = transaction.transfers.length
        ? transaction.transfers.every(t => t.to.toLowerCase() === safe.address!.toLowerCase())
        : false;

      // returns mapping of Asset -> Asset Total Value by getting the total of each asset transfered
      const transferAmountTotalsMap = transaction.transfers.reduce(totalsReducer, new Map());

      // formats totals array into readable string with Symbol
      const transferAmountTotals = Array.from(transferAmountTotalsMap.values()).map(token => {
        const totalAmount = formatWeiToValue(token.bn, token.decimals);
        const symbol = token.symbol;
        return `${totalAmount} ${symbol}`;
      });
      const transferAddresses = transaction.transfers.map(transfer =>
        transfer.to.toLowerCase() === safe.address!.toLowerCase() ? transfer.from : transfer.to
      );

      const isEthSend =
        isMultiSigTransaction &&
        !multiSigTransaction.data &&
        !multiSigTransaction.isExecuted &&
        !BigNumber.from(multiSigTransaction.value).isZero();

      if (isEthSend) {
        transferAmountTotals.push(`${formatWeiToValue(multiSigTransaction.value, 18)} ETHER`);
        transferAddresses.push(multiSigTransaction.to);
      }

      const mappedTxHashes = transaction.transfers.map(transfer => transfer.transactionHash);

      const txHashes =
        isMultiSigTransaction && mappedTxHashes.length
          ? mappedTxHashes
          : isMultiSigTransaction
          ? [multiSigTransaction.transactionHash]
          : mappedTxHashes.length
          ? mappedTxHashes
          : [ethereumTransaction.txHash];

      const eventSafeTxHash = multiSigTransaction.safeTxHash;

      const eventType = isMultiSigTransaction
        ? ActivityEventType.Governance
        : ActivityEventType.Treasury;

      const eventNonce = multiSigTransaction.nonce;

      const noncePair = transactionArr.find(tx => {
        const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
        return (
          multiSigTx.nonce === eventNonce &&
          multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash
        );
      });

      const isMultisigRejectionTx =
        isMultiSigTransaction &&
        !multiSigTransaction.data &&
        multiSigTransaction.to === multiSigTransaction.safe &&
        noncePair &&
        BigNumber.from(multiSigTransaction.value).isZero();

      const isRejected =
        isMultiSigTransaction &&
        transactionArr.find(tx => {
          const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
          return (
            multiSigTx.nonce === eventNonce &&
            multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
            multiSigTx.isExecuted
          );
        });

      const isPending =
        multiSigTransaction.confirmations?.length !== multiSigTransaction.confirmationsRequired;

      const state = isRejected
        ? TxProposalState.Rejected
        : isPending
        ? TxProposalState.Pending
        : !multiSigTransaction.isExecuted
        ? TxProposalState.Active
        : multiSigTransaction.isSuccessful && multiSigTransaction.isExecuted
        ? TxProposalState.Executed
        : TxProposalState.Pending;

      const activity: Activity = {
        transaction,
        transferAddresses,
        transferAmountTotals,
        isDeposit,
        eventDate,
        eventType,
        multisigRejectedProposalNumber:
          isMultisigRejectionTx && !!noncePair
            ? (noncePair as SafeMultisigTransactionWithTransfersResponse).safeTxHash
            : undefined,
        proposalNumber: eventSafeTxHash,
        targets: [transaction.to],
        txHashes,
        state,
      };

      return activity;
    });
  }, [safe, transactions]);

  /**
   * filters out initial multisig transaction on USUL enabled safes
   */
  const filterActivities = useMemo(() => {
    if (type === GovernanceTypes.GNOSIS_SAFE_USUL) {
      return [
        ...parsedActivities.filter(activity => activity.eventType === ActivityEventType.Treasury),
        ...txProposals,
      ];
    }
    return [...parsedActivities];
  }, [parsedActivities, type, txProposals]);

  /**
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  const sortedActivities: Activity[] = useMemo(() => {
    return [...filterActivities].sort((a, b) => {
      const dataA = new Date(a.eventDate).getTime();
      const dataB = new Date(b.eventDate).getTime();
      if (sortBy === SortBy.Oldest) {
        return dataA - dataB;
      }
      return dataB - dataA;
    });
  }, [filterActivities, sortBy]);

  /**
   * When data is ready, set loading to false
   */

  useEffect(() => {
    if (transactions.count !== null) {
      setActivitiesLoading(false);
    }
  }, [transactions]);

  return { sortedActivities, isActivitiesLoading };
};
