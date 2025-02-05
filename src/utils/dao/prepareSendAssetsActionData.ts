import { Address, encodeFunctionData, erc20Abi, getAddress, Hex } from 'viem';
import { TokenBalance } from '../../types';

export interface SendAssetsData {
  recipientAddress: Address;
  transferAmount: bigint;
  asset: TokenBalance;
  nonceInput: number | undefined; // this is only releveant when the caller action results in a proposal
}

const isNativeAsset = (asset: TokenBalance, nativeAssetAddress: Address) => {
  return (
    !asset.tokenAddress ||
    asset.nativeToken ||
    asset.tokenAddress.toLowerCase() === nativeAssetAddress.toLowerCase()
  );
};

interface SendAssetsActionData {
  tokenAddress: Address | null;
  transferAmount: bigint;
  calldata: Hex;
}

/**
 * Prepare the data for a send assets action.
 *
 * @returns Returns a `SendAssetsActionData` object.
 *
 * `.tokenAddress` is `null` if this is a native token transfer.
 *
 * `.transferAmount` is the amount of tokens to transfer.
 *
 * `.calldata` is the calldata for the transfer function. `0x` if this is a native token transfer.
 */
export const prepareSendAssetsActionData = (
  { transferAmount, asset, recipientAddress }: SendAssetsData,
  nativeAssetAddress: Address,
): SendAssetsActionData => {
  const isNative = isNativeAsset(asset, nativeAssetAddress);

  let calldata: Hex = '0x';
  if (!isNative) {
    calldata = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipientAddress, transferAmount],
    });
  }

  const tokenAddress = isNative ? null : getAddress(asset.tokenAddress);
  const actionData = {
    tokenAddress,
    transferAmount,
    calldata,
  };

  return actionData;
};
