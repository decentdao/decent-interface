import axios from 'axios';
import { useCallback } from 'react';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { DecodedTransaction, DecodedTxParam, MetaTransaction } from '../../types';
import { buildGnosisApiUrl, parseMultiSendTransactions } from '../../utils';
import { CacheKeys } from './cache/cacheDefaults';
import { DBObjectKeys, useIndexedDB } from './cache/useLocalDB';

export const useDecodeTransaction = () => {
  const { safeBaseURL } = useNetworkConfg();
  const [setValue, getValue] = useIndexedDB(DBObjectKeys.DECODED_TRANSACTIONS);

  const decodeTransactions = useCallback(
    async (strategyAddress: string, proposalId: string, transactions: MetaTransaction[]) => {
      const apiUrl = buildGnosisApiUrl(safeBaseURL, '/data-decoder/');
      const cachedTransactions = await getValue(
        CacheKeys.DECODED_TRANSACTION_PREFIX + strategyAddress + '_' + proposalId.toString()
      );

      if (!cachedTransactions) {
        let cache = true;
        const decodedTransactions = await Promise.all(
          transactions.map(async tx => {
            try {
              // a transaction without data is an Eth transfer
              if (!tx.data || tx.data.length <= 2) {
                return {
                  target: tx.to,
                  value: tx.value.toString(),
                  function: 'n/a',
                  parameterTypes: ['n/a'],
                  parameterValues: ['n/a'],
                  decodingFailed: false,
                };
              }
              const decodedData = (
                await axios.post(apiUrl, {
                  to: tx.to,
                  data: tx.data,
                })
              ).data;

              if (decodedData.parameters && decodedData.method === 'multiSend') {
                const internalTransactionsMap = new Map<number, DecodedTransaction>();
                parseMultiSendTransactions(internalTransactionsMap, decodedData.parameters);
                return [...internalTransactionsMap.values()];
              }
              const transaction: DecodedTransaction = {
                target: tx.to,
                value: tx.value.toString(),
                function: decodedData.method,
                parameterTypes: decodedData.parameters.map((param: DecodedTxParam) => param.type),
                parameterValues: decodedData.parameters.map((param: DecodedTxParam) => param.value),
              };

              return transaction;
            } catch (e) {
              cache = false;
              const transaction: DecodedTransaction = {
                target: tx.to,
                value: tx.value.toString(),
                function: 'unknown',
                parameterTypes: [],
                parameterValues: [],
                decodingFailed: true,
              };

              return transaction;
            }
          })
        );
        const flattened = decodedTransactions.flat();
        if (cache) {
          await setValue(
            CacheKeys.DECODED_TRANSACTION_PREFIX + strategyAddress + '_' + proposalId.toString(),
            flattened
          );
        }
        return flattened;
      }

      return cachedTransactions;
    },
    [safeBaseURL, setValue, getValue]
  );
  return decodeTransactions;
};
