import { utils, BigNumberish, Signer } from 'ethers';
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
  data: string | undefined;
}

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

export const signHash = async (signer: Signer, hash: string): Promise<SafeSignature> => {
  const typedDataHash = utils.arrayify(hash);
  const signerAddress = await signer.getAddress();
  try {
    const sig = await signer.signMessage(typedDataHash);
    return {
      signer: signerAddress,
      data: sig.replace(/1b$/, '1f').replace(/1c$/, '20'),
    };
  } catch (error) {
    return {
      signer: signerAddress,
      data: undefined,
    };
  }
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
