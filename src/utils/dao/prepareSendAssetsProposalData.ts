import { TFunction } from 'i18next';
import { getAddress, Hex, encodeFunctionData, erc20Abi, Address } from 'viem';
import { ProposalExecuteData, TokenBalance } from '../../types';
import { MOCK_MORALIS_ETH_ADDRESS } from '../address';
import { formatCoin } from '../numberFormats';

const isNativeAsset = (asset: TokenBalance) => {
  return (
    !asset.tokenAddress ||
    asset.nativeToken ||
    asset.tokenAddress.toLowerCase() === MOCK_MORALIS_ETH_ADDRESS.toLowerCase()
  );
};

export const prepareSendAssetsActionData = ({
  transferAmount,
  asset,
  destinationAddress,
}: {
  transferAmount: bigint;
  asset: TokenBalance;
  destinationAddress: Address;
}) => {
  const isNative = isNativeAsset(asset);

  let calldata: Hex = '0x';
  let target = isNative ? destinationAddress : getAddress(asset.tokenAddress);
  if (!isNative) {
    calldata = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [destinationAddress, transferAmount],
    });
  }

  const actionData = {
    target: target,
    value: isNative ? transferAmount : 0n,
    calldata,
  };

  return actionData;
};

export const prepareSendAssetsProposalData = ({
  transferAmount,
  asset,
  destinationAddress,
  t,
}: {
  transferAmount: bigint;
  asset: TokenBalance;
  destinationAddress: Address;
  t: TFunction<[string, string], undefined>;
}) => {
  const isNative = isNativeAsset(asset);
  const description = formatCoin(transferAmount, false, asset.decimals, asset.symbol);

  const actionData = prepareSendAssetsActionData({
    transferAmount,
    asset,
    destinationAddress,
  });

  const proposalData: ProposalExecuteData = {
    targets: [actionData.target],
    values: [actionData.value],
    calldatas: [actionData.calldata],
    metaData: {
      title: t(isNative ? 'sendEth' : 'sendToken', { ns: 'proposalMetadata' }),
      description,
      documentationUrl: '',
    },
  };

  return proposalData;
};
