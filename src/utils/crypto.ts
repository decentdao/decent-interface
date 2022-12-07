import { DecodedTransaction, MetaTransaction } from '../types';

// eslint-disable-next-line
export const decodeTransactions = (transactions: MetaTransaction[]): DecodedTransaction[] => {
  // @todo: Use data decoder
  return transactions.map(tx => ({
    target: tx.to,
    function: 'transfer',
    parameterTypes: ['uint256', 'address'],
    parameterValues: ['1000000', '0x'],
  }));
};
