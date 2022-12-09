import { BigNumber } from 'ethers';

// @todo These may get deleted later but saving just in case
export type GnosisSafeStatusResponse = {
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: [string];
  fallbackHandler: string;
  guard: string;
  version: string;
  token: string[];
} & { address: string };

export interface GnosisTransaction {
  to: string; //'<checksummed address>'
  value: BigNumber; // Value in wei
  data: string; // '<0x prefixed hex string>'
  operation: number; // 0 CALL, 1 DELEGATE_CALL
  gasToken: string; // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
  safeTxGas: BigNumber; // Max gas to use in the transaction
  baseGas: BigNumber; // Gas costs not related to the transaction execution (signature check, refund payment...)
  gasPrice: BigNumber; // Gas price used for the refund calculation
  refundReceiver: string; //Address of receiver of gas payment (or `null` if tx.origin)
  nonce: number; // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
}

export interface GnosisTransactionAPI {
  to: string; //'<checksummed address>'
  value: string; // Value in wei
  data: string; // '<0x prefixed hex string>'
  operation: number; // 0 CALL, 1 DELEGATE_CALL
  gasToken: string | null; // '<checksummed address>' Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
  safeTxGas: number; // Max gas to use in the transaction
  baseGas: number; // Gas costs not related to the transaction execution (signature check, refund payment...)
  gasPrice: number; // Gas price used for the refund calculation
  refundReceiver: string | null; // '<checksummed address>' Address of receiver of gas payment (or `null` if tx.origin)
  nonce: number; // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
  contractTransactionHash: string; // Contract transaction hash calculated from all the field
  sender: string; // '<checksummed address>' Owner of the Safe proposing the transaction. Must match one of the signatures
  signature: string; // '<0x prefixed hex string>' One or more ethereum ECDSA signatures of the `contractTransactionHash` as an hex string
  origin: string; // Give more information about the transaction, e.g. "My Custom Safe app"
}

export interface TokenInfoResponse {
  type: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
}

export interface GnosisTransfer {
  // 'ETHER_TRANSFER'
  type: string;
  // '2022-11-04T17:46:12Z'
  executionDate: string;
  blockNumber: number;
  transactionHash: string;
  to: string;
  // in wei
  value: string | null;
  tokenId: string | null;
  tokenAddress: string | null;
  tokenInfo: TokenInfoResponse | null;
  from: string;
}

export interface EthereumTxWithTransfers {
  // '2022-11-04T17:46:12Z'
  executionDate: string;
  to: string;
  data: string | null;
  txHash: string;
  blockNumber: number;
  transfers: GnosisTransfer[];
  // 'ETHEREUM_TRANSACTION' | "MULTISIG_TRANSACTION"
  txType: string;
  from: string;
}

export declare enum Operation {
  CALL = 0,
  DELEGATE = 1,
}
export declare type InternalTransaction = {
  operation: Operation;
  to: string;
  value?: string;
  data?: string;
  dataDecoded?: DataDecoded;
};
export declare type ValueDecodedType = InternalTransaction[];

export type ParamValue = string | ParamValue[];

export type Parameter = {
  name: string;
  type: string;
  value: ParamValue;
  valueDecoded?: ValueDecodedType;
};

export declare type DataDecoded = {
  method: string;
  parameters?: Parameter[];
};

export type AssetTotals = {
  bn: BigNumber;
  symbol: string;
  decimals: number;
};
