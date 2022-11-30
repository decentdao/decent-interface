import {
  EthereumTxWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@gnosis.pm/safe-service-client';
import { format } from 'date-fns';
import { BigNumber, constants } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { BadgeLabels } from '../../../../components/ui/badges/Badge';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { ActivityEventType, GnosisTransferType, SortBy } from '../../../../types';
import { formatWeiToValue } from '../../../../utils';

export const useActivities = (sortBy: SortBy) => {
  const {
    gnosis: { safe, transactions },
  } = useFractal();

  const [isActivitiesLoading, setActivitiesLoading] = useState<boolean>(true);

  const parsedActivities = useMemo(() => {
    if (!transactions.results.length || !safe) {
      return [];
    }
    return transactions.results.map((transaction, i, transactionArr) => {
      const isMultiSigTransaction = transaction.txType === 'MULTISIG_TRANSACTION';

      const isDeposit = transaction.transfers.every(
        t => t.to.toLowerCase() === safe.address!.toLowerCase()
      );

      /**
       * This returns a Mapping of the total amount of each token involved in the transfers
       * along with the symbol and decimals of those tokens
       */
      const transferAmountTotalsMap = transaction.transfers.reduce((prev, cur) => {
        if (cur.type === GnosisTransferType.ETHER && cur.value) {
          if (prev.has(constants.AddressZero)) {
            const prevValue = prev.get(constants.AddressZero);
            prev.set(constants.AddressZero, {
              bn: prevValue.bn.add(BigNumber.from(cur.value)),
              symbol: 'ETHER',
              decimals: 18,
            });
          }
          prev.set(constants.AddressZero, {
            bn: BigNumber.from(cur.value),
            symbol: 'ETHER',
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
          if (prev.has(cur.tokenInfo.address)) {
            const prevValue = prev.get(cur.tokenInfo.address);
            prev.set(cur.tokenInfo.address, {
              ...prevValue,
              bn: prevValue.bn.add(BigNumber.from(cur.value)),
            });
          } else {
            prev.set(cur.tokenAddress, {
              bn: BigNumber.from(cur.value),
              symbol: cur.tokenInfo.symbol,
              decimals: cur.tokenInfo.decimals,
            });
          }
        }

        return prev;
      }, new Map());

      const eventTransactionMap = new Map<number, any>();

      const parseTransactions = (parameters: any[]) => {
        if (!parameters || !parameters.length) {
          return;
        }
        parameters.forEach((param: any) => {
          const dataDecoded = param.dataDecoded || param.valueDecoded;

          if (param.to) {
            eventTransactionMap.set(eventTransactionMap.size, {
              address: param.to,
            });
          }
          return parseTransactions(dataDecoded);
        });
      };

      const dataDecoded = (
        transaction as
          | SafeModuleTransactionWithTransfersResponse
          | SafeMultisigTransactionWithTransfersResponse
      ).dataDecoded as any;
      if (dataDecoded && isMultiSigTransaction) {
        parseTransactions(dataDecoded.parameters);
      }

      const transferAmountTotals = Array.from(transferAmountTotalsMap.values()).map(token => {
        const totalAmount = formatWeiToValue(token.bn, token.decimals);
        const symbol = token.symbol;
        return `${totalAmount} ${symbol}`;
      });
      const transferAddresses = transaction.transfers.map(transfer =>
        transfer.to.toLowerCase() === safe.address!.toLowerCase() ? transfer.from : transfer.to
      );

      const eventDate = format(
        new Date(
          (transaction as SafeMultisigTransactionWithTransfersResponse).submissionDate ||
            (
              transaction as
                | SafeModuleTransactionWithTransfersResponse
                | SafeMultisigTransactionWithTransfersResponse
            ).executionDate
        ),
        'MMM dd yyyy'
      );

      const eventTxHash =
        (
          transaction as
            | SafeMultisigTransactionWithTransfersResponse
            | SafeModuleTransactionWithTransfersResponse
        ).transactionHash || (transaction as EthereumTxWithTransfersResponse).txHash;

      const eventSafeTxHash = (transaction as SafeMultisigTransactionWithTransfersResponse)
        .safeTxHash;

      const eventType = isMultiSigTransaction
        ? ActivityEventType.Governance
        : ActivityEventType.Treasury;

      const multiSigTransaction = transaction as SafeMultisigTransactionWithTransfersResponse;

      const isRejected = transactionArr.find(
        tx =>
          (tx as SafeMultisigTransactionWithTransfersResponse).nonce ===
            multiSigTransaction.nonce &&
          (tx as SafeMultisigTransactionWithTransfersResponse).safeTxHash !==
            multiSigTransaction.safeTxHash &&
          (tx as SafeMultisigTransactionWithTransfersResponse).isExecuted
      );

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

      const eventNonce = multiSigTransaction.nonce;

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
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  const sortedActivities = useMemo(() => {
    return [...parsedActivities].sort((a, b) => {
      const dataA = new Date(a.eventDate).getTime();
      const dataB = new Date(b.eventDate).getTime();
      if (sortBy === SortBy.Oldest) {
        return dataA - dataB;
      }
      return dataB - dataA;
    });
  }, [parsedActivities, sortBy]);

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
