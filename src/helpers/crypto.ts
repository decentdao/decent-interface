import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { BigNumber, Contract, constants, utils, BigNumberish, Signer } from 'ethers';
import { polygon } from 'wagmi/chains';
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
  const bytes8Array = new Uint8Array(32);
  self.crypto.getRandomValues(bytes8Array);
  const bytes32 = '0x' + bytes8Array.reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), '');
  return bytes32;
}

export const calculateSafeTransactionHash = (
  safe: Contract,
  safeTx: SafeTransaction,
  chainId: BigNumberish
): string => {
  return utils._TypedDataEncoder.hash(
    { verifyingContract: safe.address, chainId },
    EIP712_SAFE_TX_TYPE,
    safeTx
  );
};

export const buildSignatureBytes = (signatures: SafeSignature[]): string => {
  signatures.sort((left, right) =>
    left.signer.toLowerCase().localeCompare(right.signer.toLowerCase())
  );
  let signatureBytes = '0x';
  for (const sig of signatures) {
    signatureBytes += sig.data.slice(2);
  }
  return signatureBytes;
};

export const buildSafeTransaction = (template: {
  to: string;
  value?: BigNumber | number | string;
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
    gasToken: template.gasToken || constants.AddressZero,
    refundReceiver: template.refundReceiver || constants.AddressZero,
    nonce: template.nonce,
  };
};

export const safeSignTypedData = async (
  signer: Signer & TypedDataSigner,
  safe: Contract,
  safeTx: SafeTransaction,
  chainId?: BigNumberish
): Promise<SafeSignature> => {
  if (!chainId && !signer.provider) throw Error('Provider required to retrieve chainId');
  const cid = chainId || (await signer.provider!.getNetwork()).chainId;
  const signerAddress = await signer.getAddress();
  return {
    signer: signerAddress,
    data: await signer._signTypedData(
      { verifyingContract: safe.address, chainId: cid },
      EIP712_SAFE_TX_TYPE,
      safeTx
    ),
  };
};

export const buildSafeAPIPost = async (
  gnosisContract: Contract,
  signerOrProvider: Signer & TypedDataSigner,
  chainId: number,
  template: {
    to: string;
    value?: BigNumber | number | string;
    data?: string;
    operation?: number;
    safeTxGas?: number | string;
    baseGas?: number | string;
    gasPrice?: number | string;
    gasToken?: string;
    refundReceiver?: string;
    nonce: number;
  }
): Promise<SafePostTransaction> => {
  const safeTx = buildSafeTransaction(template);

  const txHash = calculateSafeTransactionHash(gnosisContract, safeTx, chainId);
  const sig = [
    await safeSignTypedData(
      signerOrProvider as Signer & TypedDataSigner,
      gnosisContract,
      safeTx,
      chainId
    ),
  ];
  const signatureBytes = buildSignatureBytes(sig);
  return {
    safe: gnosisContract.address,
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
  overrides?: Partial<SafeTransaction>
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
      overrides
    )
  );
};

const encodeMetaTransaction = (tx: MetaTransaction): string => {
  const data = utils.arrayify(tx.data);
  const encoded = utils.solidityPack(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [tx.operation, tx.to, tx.value, data.length, data]
  );
  return encoded.slice(2);
};

export const encodeMultiSend = (txs: MetaTransaction[]): string => {
  return '0x' + txs.map(tx => encodeMetaTransaction(tx)).join('');
};

export const buildMultiSendSafeTx = (
  multiSend: Contract,
  txs: MetaTransaction[],
  nonce: number,
  overrides?: Partial<SafeTransaction>
): SafeTransaction => {
  return buildContractCall(multiSend, 'multiSend', [encodeMultiSend(txs)], nonce, true, overrides);
};

/**
 * Explained by our future overlord, ChatGPT:
 *
 * On networks like Polygon where block times are very short, events cannot be
 * looked up without specifying a starting block number. If a user connects their
 * Metamask wallet to Polygon as a public provider, attempting to load events in
 * this way would cause it to fail, resulting in reduced performance and a high
 * probability of failure.
 *
 * While power users can swap out the remote procedure call (RPC) in their
 * Metamask for a custom one, this option is not feasible for most users. As a
 * solution, the contract can be used as a provider with our own keys, allowing
 * us to use our own rate limits.
 *
 * This gave rise to the idea of updating the useSafeContracts hook to enable
 * connections as signers (using a connected wallet) or using our own keys as
 * providers. The asSigner option is essentially connecting as a signer or provider,
 * making it the ideal choice for most normal use cases.
 */
export function getEventRPC<T>(connection: ContractConnection<T>, chainId: number): T {
  switch (chainId) {
    case polygon.id:
      return connection.asProvider;
    default:
      return connection.asSigner;
  }
}
