import { BigNumber } from 'ethers';

export interface MetaTransaction {
  to: string;
  value: string | number | BigNumber;
  data: string;
  operation: number;
}
export interface SafeTransaction extends MetaTransaction {
  safeTxGas: string | number;
  baseGas: string | number;
  gasPrice: string | number;
  gasToken: string;
  refundReceiver: string;
  nonce: string | number;
}

export interface TransactionData {
  targetAddress: string;
  functionName: string;
  functionSignature: string;
  parameters: string;
  addressError?: string;
  fragmentError?: string;
}
