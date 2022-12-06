import { DecodedTransaction, MetaTransaction } from '../types';

// eslint-disable-next-line
export const decodeTransactions = (transactions: MetaTransaction[]): DecodedTransaction[] => {
  // @todo - implement decoding transactions

  const MOCK_DECODED_TRANSACTIONS: DecodedTransaction[] = [
    {
      target: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29d',
      function: 'firstFunction',
      parameterTypes: ['uint256', 'string'],
      parameterValues: ['420', 'hello world'],
    },
    {
      target: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29d',
      function: 'secondFunction',
      parameterTypes: ['uint256', 'string'],
      parameterValues: ['420', 'hello world'],
    },
    {
      target: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29d',
      function: 'thirdFunction',
      parameterTypes: ['uint256', 'string'],
      parameterValues: ['420', 'hello world'],
    },
  ];

  return MOCK_DECODED_TRANSACTIONS;
};
