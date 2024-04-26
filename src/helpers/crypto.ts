import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { Contract, Signer } from 'ethers';
import { hashTypedData, Hash, zeroAddress, toHex, toBytes, encodePacked, getAddress, Address, bytesToBigInt } from 'viem';
import { sepolia, mainnet } from 'wagmi/chains';
import { ContractConnection } from '../types';
import { MetaTransaction, SafePostTransaction, SafeTransaction } from '../types/transaction';

export interface SafeSignature {
  signer: string;
  data: string;
}

export const EIP712_SAFE_TX_TYPE = {
  // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
  SafeTx: [
    { type: 'address', name: 'to' },
    { type: 'uint256', name: 'value' },
    { type: 'bytes', name: 'data' },
    { type: 'uint8', name: 'operation' },
    { type: 'uint256', name: 'safeTxGas' },
    { type: 'uint256', name: 'baseGas' },
    { type: 'uint256', name: 'gasPrice' },
    { type: 'address', name: 'gasToken' },
    { type: 'address', name: 'refundReceiver' },
    { type: 'uint256', name: 'nonce' },
  ],
};

export function getRandomBytes() {
  return bytesToBigInt(self.crypto.getRandomValues(new Uint8Array(32)));
}

export const calculateSafeTransactionHash = (
  safe: Contract,
  safeTx: SafeTransaction,
  chainId: number,
): string => {
  return hashTypedData({
    domain: { verifyingContract: getAddress(safe.address), chainId },
    types: EIP712_SAFE_TX_TYPE,
    primaryType: 'SafeTx',
    message: { safeTx },
  });
};

export const buildSignatureBytes = (signatures: SafeSignature[]) => {
  signatures.sort((left, right) =>
    left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()),
  );
  let signatureBytes: Hash = '0x';
  for (const sig of signatures) {
    signatureBytes += sig.data.slice(2);
  }
  return signatureBytes;
};

export const buildSafeTransaction = (template: {
  to: Address;
  value?: bigint | number | string;
  data?: string;
  operation?: number;
  safeTxGas?: number | string;
  baseGas?: number | string;
  gasPrice?: number | string;
  gasToken?: string;
  refundReceiver?: string;
  nonce: number;
}): SafeTransaction => {
  return {
    to: template.to,
    value: template.value?.toString() || 0,
    data: template.data || '0x',
    operation: template.operation || 0,
    safeTxGas: template.safeTxGas || 0,
    baseGas: template.baseGas || 0,
    gasPrice: template.gasPrice || 0,
    gasToken: template.gasToken || zeroAddress,
    refundReceiver: template.refundReceiver || zeroAddress,
    nonce: template.nonce,
  };
};

export const safeSignTypedData = async (
  signer: Signer & TypedDataSigner,
  safe: Contract,
  safeTx: SafeTransaction,
  chainId?: number,
): Promise<SafeSignature> => {
  if (!chainId && !signer.provider) throw Error('Provider required to retrieve chainId');
  const cid = chainId || (await signer.provider!.getNetwork()).chainId;
  const signerAddress = await signer.getAddress();
  return {
    signer: signerAddress,
    data: await signer._signTypedData(
      { verifyingContract: safe.address, chainId: cid },
      EIP712_SAFE_TX_TYPE,
      safeTx,
    ),
  };
};

export const buildSafeAPIPost = async (
  safeContract: Contract,
  signerOrProvider: Signer & TypedDataSigner,
  chainId: number,
  template: {
    to: Address;
    value?: bigint | number | string;
    data?: string;
    operation?: number;
    safeTxGas?: number | string;
    baseGas?: number | string;
    gasPrice?: number | string;
    gasToken?: string;
    refundReceiver?: string;
    nonce: number;
  },
): Promise<SafePostTransaction> => {
  const safeTx = buildSafeTransaction(template);

  const txHash = calculateSafeTransactionHash(safeContract, safeTx, chainId);
  const sig = [
    await safeSignTypedData(
      signerOrProvider as Signer & TypedDataSigner,
      safeContract,
      safeTx,
      chainId,
    ),
  ];
  const signatureBytes = buildSignatureBytes(sig);
  return {
    safe: safeContract.address,
    to: safeTx.to,
    value: safeTx.value,
    data: safeTx.data,
    operation: safeTx.operation,
    safeTxGas: safeTx.safeTxGas,
    baseGas: safeTx.baseGas,
    gasPrice: safeTx.gasPrice,
    gasToken: safeTx.gasToken,
    refundReceiver: safeTx.refundReceiver,
    nonce: safeTx.nonce,
    contractTransactionHash: txHash,
    sender: await signerOrProvider.getAddress(),
    signature: signatureBytes,
  };
};

export const buildContractCall = (
  contract: Contract,
  method: string,
  params: any[],
  nonce: number,
  delegateCall?: boolean,
  overrides?: Partial<SafeTransaction>,
): SafeTransaction => {
  const data = contract.interface.encodeFunctionData(method, params);
  return buildSafeTransaction(
    Object.assign(
      {
        to: contract.address,
        data,
        operation: delegateCall ? 1 : 0,
        nonce,
      },
      overrides,
    ),
  );
};

const encodeMetaTransaction = (tx: MetaTransaction): string => {
  const data = toHex(toBytes(tx.data));
  const encoded = encodePacked(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [tx.operation, tx.to, BigInt(tx.value), BigInt(data.length), data],
  );
  return encoded.slice(2);
};

export const encodeMultiSend = (txs: MetaTransaction[]): string => {
  return '0x' + txs.map(tx => encodeMetaTransaction(tx)).join('');
};

/**
 * TODO: Remove getEventRPC usage as whole
 */
export function getEventRPC<T>(connection: ContractConnection<T>): T {
  return connection.asProvider;
}

export function supportsENS(chainId: number): boolean {
  return chainId === sepolia.id || chainId == mainnet.id || chainId == sepolia.id;
}
