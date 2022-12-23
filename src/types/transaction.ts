import { BigNumber } from 'ethers';

export interface DecodedTransaction {
  target: string;
  function: string;
  parameterTypes: string[];
  parameterValues: string[];
}
export interface MetaTransaction {
  to: string;
  value: string | number | BigNumber;
  data: string;
  operation: number;
}

export interface SafePostTransaction extends SafeTransaction {
  safe: string;
  contractTransactionHash: string;
  sender: string;
  signature: string;
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
  isExpanded: boolean;
  encodedFunctionData: string | undefined;
}

export type DecodedTxParam = {
  name: string;
  type: string;
  value: string;
};
