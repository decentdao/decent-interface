import { BigNumber } from 'ethers';
export interface TransactionData {
  targetAddress: string;
  functionName: string;
  functionSignature: string;
  parameters: string;
  addressError?: string;
  fragmentError?: string;
}
export interface GnosisTransactionData {
  to: string;
  value: BigNumber;
  data: string;
  operation: number;
  gasToken: string;
  safeTxGas: BigNumber;
  baseGas: BigNumber;
  gasPrice: BigNumber;
  refundReceiver: string;
  nonce: number;
  // contractTransactionHash: string;
  // sender: string;
  // signature: string;
  // origin: string;
}
