import { TFunction } from 'i18next';
import { getAddress, Hex, encodeFunctionData, erc20Abi, Address } from 'viem';
import { ProposalExecuteData, TokenBalance } from '../../../types';
import { MOCK_MORALIS_ETH_ADDRESS } from '../../../utils/address';
import { formatCoin } from '../../../utils/numberFormats';

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
  const isEth =
    !asset.tokenAddress ||
    asset.nativeToken ||
    asset.tokenAddress.toLowerCase() === MOCK_MORALIS_ETH_ADDRESS.toLowerCase();
  const description = formatCoin(transferAmount, false, asset.decimals, asset.symbol);

  let calldatas: Hex[] = ['0x'];
  let target = isEth ? destinationAddress : getAddress(asset.tokenAddress);
  if (!isEth) {
    calldatas = [
      encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [destinationAddress, transferAmount],
      }),
    ];
  }

  const proposalData: ProposalExecuteData = {
    targets: [target],
    values: [isEth ? transferAmount : 0n],
    calldatas,
    metaData: {
      title: t(isEth ? 'sendEth' : 'sendToken', { ns: 'proposalMetadata' }),
      description,
      documentationUrl: '',
    },
  };

  return proposalData;
};
