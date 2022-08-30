import {
  BigNumber,
  utils,
  Contract,
  Wallet,
  BigNumberish,
  Signer,
  PopulatedTransaction,
} from 'ethers';

import { Interface } from 'ethers/lib/utils';
import { GnosisTransactionData } from '../../../types/transaction';

export const EIP_DOMAIN = {
  EIP712Domain: [
    { type: 'uint256', name: 'chainId' },
    { type: 'address', name: 'verifyingContract' },
  ],
};

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

export const EIP712_SAFE_MESSAGE_TYPE = {
  // "SafeMessage(bytes message)"
  SafeMessage: [{ type: 'bytes', name: 'message' }],
};

export interface SafeSignature {
  signer: string;
  data: string;
}

export function parseInterface(interfaces: utils.Interface[]): string[] {
  return interfaces.map(iface => {
    return Object.keys(iface.functions)
      .reduce((p, c) => {
        const functionFragment = iface.functions[c];
        const sigHash = iface.getSighash(functionFragment);
        return p.xor(BigNumber.from(sigHash));
      }, BigNumber.from(0))
      .toHexString();
  });
}

export const calculateSafeDomainSeparator = (safe: Contract, chainId: BigNumberish): string => {
  return utils._TypedDataEncoder.hashDomain({
    verifyingContract: safe.address,
    chainId,
  });
};

export const preimageSafeTransactionHash = (
  safe: Contract,
  safeTx: GnosisTransactionData,
  chainId: BigNumberish
): string => {
  return utils._TypedDataEncoder.encode(
    { verifyingContract: safe.address, chainId },
    EIP712_SAFE_TX_TYPE,
    safeTx
  );
};

export const calculateSafeTransactionHash = (
  safeAddress: string,
  safeTx: GnosisTransactionData,
  chainId: BigNumberish
): string => {
  return utils._TypedDataEncoder.hash(
    { verifyingContract: safeAddress, chainId },
    EIP712_SAFE_TX_TYPE,
    safeTx
  );
};

export const calculateSafeMessageHash = (
  safeAddress: string,
  message: string,
  chainId: BigNumberish
): string => {
  return utils._TypedDataEncoder.hash(
    { verifyingContract: safeAddress, chainId },
    EIP712_SAFE_MESSAGE_TYPE,
    { message }
  );
};

export const signHash = async (signer: Signer, hash: string): Promise<SafeSignature> => {
  const typedDataHash = utils.arrayify(hash);
  const signerAddress = await signer.getAddress();
  return {
    signer: signerAddress,
    data: (await signer.signMessage(typedDataHash)).replace(/1b$/, '1f').replace(/1c$/, '20'),
  };
};

export const safeSignMessage = async (
  signer: Signer,
  safeAddress: string,
  safeTx: GnosisTransactionData,
  chainId?: BigNumberish
): Promise<SafeSignature> => {
  const cid = chainId || (await signer.provider!.getNetwork()).chainId;
  return signHash(signer, calculateSafeTransactionHash(safeAddress, safeTx, cid));
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

export const logGas = async (message: string, tx: Promise<any>, skip?: boolean): Promise<any> => {
  return tx.then(async result => {
    const receipt = await result.wait();
    if (!skip) console.log('           Used', receipt.gasUsed.toNumber(), `gas for >${message}<`);
    return result;
  });
};

export const executeTx = async (
  safe: Contract,
  safeTx: GnosisTransactionData,
  signatures: SafeSignature[],
  overrides?: any
): Promise<any> => {
  const signatureBytes = buildSignatureBytes(signatures);
  return safe.execTransaction(
    safeTx.to,
    safeTx.value,
    safeTx.data,
    safeTx.operation,
    safeTx.safeTxGas,
    safeTx.baseGas,
    safeTx.gasPrice,
    safeTx.gasToken,
    safeTx.refundReceiver,
    signatureBytes,
    overrides || {}
  );
};

export const populateExecuteTx = async (
  safe: Contract,
  safeTx: GnosisTransactionData,
  signatures: SafeSignature[],
  overrides?: any
): Promise<PopulatedTransaction> => {
  const signatureBytes = buildSignatureBytes(signatures);
  return safe.populateTransaction.execTransaction(
    safeTx.to,
    safeTx.value,
    safeTx.data,
    safeTx.operation,
    safeTx.safeTxGas,
    safeTx.baseGas,
    safeTx.gasPrice,
    safeTx.gasToken,
    safeTx.refundReceiver,
    signatureBytes,
    overrides || {}
  );
};
