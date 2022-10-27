import { BigNumber } from 'ethers';
import { GnosisAssetFungible, GnosisAssetNonFungible } from '../../treasury/types';

export type GnosisSafeStatusResponse = {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: [string];
  fallbackHandler: string;
  guard: string;
  version: string;
  token: string[];
};

export type GnosisSafeFAssetResponse = GnosisAssetFungible[];
export type GnosisSafeNFAssetResponse = GnosisAssetNonFungible[];

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
