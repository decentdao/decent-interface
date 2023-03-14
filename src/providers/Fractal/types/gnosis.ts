import { BigNumber } from 'ethers';

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
