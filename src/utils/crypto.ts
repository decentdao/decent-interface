import axios from 'axios';
import { isAddress } from 'ethers/lib/utils';
import { buildGnosisApiUrl, parseMultiSendTransactions } from '../providers/Fractal/utils';
import { DecodedTransaction, DecodedTxParam, MetaTransaction } from '../types';

export const decodeTransactions = async (
  transactions: MetaTransaction[],
  chainId: number
): Promise<DecodedTransaction[]> => {
  const apiUrl = buildGnosisApiUrl(chainId, '/data-decoder/');
  const decodedTransactions = await Promise.all(
    transactions.map(async tx => {
      try {
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

        return {
          target: tx.to,
          function: decodedData.method,
          parameterTypes: decodedData.parameters.map((param: DecodedTxParam) => param.type),
          parameterValues: decodedData.parameters.map((param: DecodedTxParam) => param.value),
        };
      } catch (e) {
        return {
          target: tx.to,
          function: 'unknown',
          parameterTypes: [],
          parameterValues: [],
        };
      }
    })
  );

  return decodedTransactions.flat();
};

export const isSameAddress = (addr1: string, addr2: string) => {
  if (!isAddress(addr1) || !isAddress(addr2)) {
    return false;
  }
  return addr1.toLowerCase() === addr2.toLowerCase();
};
