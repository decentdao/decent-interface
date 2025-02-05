import { Address, encodeFunctionData, erc20Abi, getAddress, Hex } from 'viem';
import { TokenBalance } from '../../types';
import { MOCK_MORALIS_ETH_ADDRESS } from '../address';

const isNativeAsset = (asset: TokenBalance) => {
  return (
    !asset.tokenAddress ||
    asset.nativeToken ||
    asset.tokenAddress.toLowerCase() === MOCK_MORALIS_ETH_ADDRESS.toLowerCase() // @todo: verify comparing with MOCK_MORALIS_ETH_ADDRESS works for all chains
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
export const prepareSendAssetsActionData = ({
  transferAmount,
  asset,
  recipientAddress,
}: {
  transferAmount: bigint;
  asset: TokenBalance;
  recipientAddress: Address;
}): SendAssetsActionData => {
  const isNative = isNativeAsset(asset);

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
