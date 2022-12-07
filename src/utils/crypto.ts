import axios from 'axios';
import { buildGnosisApiUrl } from '../providers/Fractal/utils';
import { DecodedTransaction, DecodedTxParam, MetaTransaction } from '../types';

export const decodeTransactions = async (
  transactions: MetaTransaction[],
  chainId: number
): Promise<DecodedTransaction[]> => {
  const apiUrl = buildGnosisApiUrl(chainId, '/data-decoder/');
  return Promise.all(
    transactions.map(async tx => {
      try {
        const decodedData = (
          await axios.post(apiUrl, {
            to: tx.to,
            data: tx.data,
          })
        ).data;
        return {
          target: tx.to,
          function: decodedData.method,
          parameterTypes: decodedData.parameters.map((param: DecodedTxParam) => param.type),
          parameterValues: decodedData.parameters.map((param: DecodedTxParam) => param.value),
        };
      } catch (e) {
        return {
          target: tx.to,
          function: 'unkown',
          parameterTypes: [],
          parameterValues: [],
        };
      }
    })
  );
};
