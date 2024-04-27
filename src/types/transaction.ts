import { Address, Hex } from 'viem';

export interface DecodedTransaction {
  target: string;
  value: string;
  function: string;
  parameterTypes: string[];
  parameterValues: string[];
  decodingFailed?: boolean;
}
export interface MetaTransaction {
  to: Address;
  value: bigint;
  data: Hex;
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
export type DecodedTxParam = {
  name: string;
  type: string;
  value: string;
};

export interface SafeAPITransaction {
  to: Address; //'<checksummed address>'
  value: bigint; // Value in wei
  data: Hex; // '<0x prefixed hex string>'
  operation: 0 | 1; // 0 CALL, 1 DELEGATE_CALL
  gasToken: string; // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
  safeTxGas: bigint; // Max gas to use in the transaction
  baseGas: bigint; // Gas costs not related to the transaction execution (signature check, refund payment...)
  gasPrice: bigint; // Gas price used for the refund calculation
  refundReceiver: string; //Address of receiver of gas payment (or `null` if tx.origin)
  nonce: number; // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
}
