import { Address, encodeFunctionData, erc20Abi, Hex } from 'viem';
import { ProposalActionType, TokenBalance } from '../../types';
import { formatCoin } from '../numberFormats';

export interface SendAssetsData {
  recipientAddress: Address;
  transferAmount: bigint;
  asset: TokenBalance;
  nonceInput: number | undefined; // this is only releveant when the caller action results in a proposal
}

/**
 * Prepare the data for a send assets action.
 *
 * @returns Returns a `SendAssetsActionData` object.
 *
 * `.tokenAddress` is `null` if this is a native token transfer.
 *
 * `.transferAmount` is the amount of tokens being transferred.
 *
 * `.calldata` is the calldata for the transfer function. `0x` if this is a native token transfer.
 */
export const prepareSendAssetsActionData = ({
  transferAmount,
  asset,
  recipientAddress,
}: SendAssetsData) => {
  let calldata: Hex = '0x';
  if (!asset.nativeToken) {
    calldata = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipientAddress, transferAmount],
    });
  }

  const tokenAddress = asset.nativeToken ? null : asset.tokenAddress;
  const actionData = {
    tokenAddress,
    transferAmount,
    calldata,
  };

  const isNativeTransfer = tokenAddress === null;

  const formattedNativeTokenValue = formatCoin(
    transferAmount,
    true,
    asset.decimals,
    asset.symbol,
    false,
  );

  // Don't transfer native tokens if this is not a native token transfer.
  // Amount to transfer will be the 2nd parameter of the transfer function.
  const ethValue = isNativeTransfer
    ? {
        bigintValue: transferAmount,
        value: formattedNativeTokenValue,
      }
    : { bigintValue: 0n, value: '0' };

  // If the transfer is a native token transfer, we use the destination address as the target address
  // Otherwise, the target is the token address, on which transfer function is called
  const targetAddress = isNativeTransfer ? recipientAddress : tokenAddress;

  const action = {
    actionType: ProposalActionType.TRANSFER,
    content: <></>,
    transactions: [
      {
        targetAddress,
        ethValue,
        functionName: isNativeTransfer ? '' : 'transfer',
        parameters: isNativeTransfer
          ? []
          : [
              { signature: 'address', value: recipientAddress },
              { signature: 'uint256', value: transferAmount.toString() },
            ],
      },
    ],
  };

  return {
    action,
    // @dev used for building role proposals when send asset action is added
    ...actionData,
  };
};
