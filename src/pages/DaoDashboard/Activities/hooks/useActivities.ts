import {
  EthereumTxWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@gnosis.pm/safe-service-client';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { BadgeLabels } from '../../../../components/ui/badges/Badge';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../../../providers/Fractal/types';
import { eventTransactionMapping, totalsReducer } from '../../../../providers/Fractal/utils';
import { ActivityEventType, SortBy } from '../../../../types';
import { formatWeiToValue } from '../../../../utils';

export const useActivities = (sortBy: SortBy) => {
  const {
    gnosis: { safe, transactions },
    governance: { type },
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

      // ETHEREUM TRANSACTION

      // Determines whether transaction transfer is being sent or received if exists
      const isDeposit = transaction.transfers.every(
        t => t.to.toLowerCase() === safe.address!.toLowerCase()
      );

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

      // Date that event is created
      // @note for ethereum transactions event these are the execution date
      const eventDate = format(
        new Date(multiSigTransaction.submissionDate || ethereumTransaction.executionDate),
        'MMM dd yyyy'
      );

      // block explorer transaction hash. This is only being used for ETHEREUM TRANSACTIONS
      const eventTxHash = ethereumTransaction.txHash || multiSigTransaction.transactionHash;

      // MULTISIG SPECIFIC

      // mapping of each interacted contract address. this is used to calculate the number of transactions in a multisig transaction
      const eventTransactionMap = eventTransactionMapping(
        multiSigTransaction,
        isMultiSigTransaction
      );

      // Used as the proposal id for multisig transactions
      const eventSafeTxHash = multiSigTransaction.safeTxHash;

      const eventType = isMultiSigTransaction
        ? ActivityEventType.Governance
        : ActivityEventType.Treasury;

      // nonce of current event
      const eventNonce = multiSigTransaction.nonce;

      // Check to see if a proposal has been successfully executed to reject current transaction
      const isRejected = transactionArr.find(tx => {
        const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
        return (
          multiSigTx.nonce === eventNonce &&
          multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
          multiSigTx.isExecuted
        );
      });

      const isPending =
        multiSigTransaction.confirmations?.length !== multiSigTransaction.confirmationsRequired;

      const eventState = isRejected
        ? BadgeLabels.STATE_REJECTED
        : isPending
        ? BadgeLabels.STATE_PENDING
        : !multiSigTransaction.isExecuted
        ? BadgeLabels.STATE_ACTIVE
        : multiSigTransaction.isSuccessful && multiSigTransaction.isExecuted
        ? BadgeLabels.STATE_EXECUTED
        : undefined;

      return {
        transaction,
        transferAddresses,
        transferAmountTotals,
        isDeposit,
        eventDate,
        eventType,
        eventTxHash,
        eventSafeTxHash,
        eventTransactionsCount: isMultiSigTransaction ? eventTransactionMap.size || 1 : undefined,
        eventState,
        eventNonce: eventNonce,
      };
    });
  }, [safe, transactions]);

  /**
   * filters out initial multisig transaction on USUL enabled safes
   */
  const filterActivities = useMemo(() => {
    if (type === GovernanceTypes.GNOSIS_SAFE_USUL) {
      return [...parsedActivities].filter(
        activity => activity.eventType === ActivityEventType.Treasury
      );
    }
    return [...parsedActivities];
  }, [parsedActivities, type]);

  /**
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  const sortedActivities = useMemo(() => {
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
