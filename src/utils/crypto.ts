import axios from 'axios';
import { utils } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { logError } from '../helpers/errorLogging';
import { buildGnosisApiUrl, parseMultiSendTransactions } from '../providers/Fractal/utils';
import { DecodedTransaction, DecodedTxParam, MetaTransaction } from '../types';

export const decodeTransactions = async (
  transactions: MetaTransaction[],
  baseUrl: string
): Promise<DecodedTransaction[]> => {
  const apiUrl = buildGnosisApiUrl(baseUrl, '/data-decoder/');
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
          value: tx.value.toString(),
          function: decodedData.method,
          parameterTypes: decodedData.parameters.map((param: DecodedTxParam) => param.type),
          parameterValues: decodedData.parameters.map((param: DecodedTxParam) => param.value),
        };
      } catch (e) {
        return {
          target: tx.to,
          value: tx.value.toString(),
          function: 'unknown',
          parameterTypes: [],
          parameterValues: [],
          decodingFailed: true,
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

export const encodeFunction = (
  _functionName: string,
  _functionSignature?: string,
  _parameters?: string
) => {
  let functionSignature = `function ${_functionName}`;
  if (_functionSignature) {
    functionSignature = functionSignature.concat(`(${_functionSignature})`);
  } else {
    functionSignature = functionSignature.concat('()');
  }
  const parameters = !!_parameters ? _parameters.split(',').map(p => (p = p.trim())) : undefined;
  try {
    return new utils.Interface([functionSignature]).encodeFunctionData(_functionName, parameters);
  } catch (e) {
    logError(e);
    return;
  }
};
