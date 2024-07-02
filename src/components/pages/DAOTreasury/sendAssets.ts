import { isAddress, getAddress, Hex, encodeFunctionData, erc20Abi } from 'viem';
import { SubmitProposalFunction } from '../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData, TokenBalance } from '../../../types';
import { MOCK_MORALIS_ETH_ADDRESS } from '../../../utils/address';
import { formatCoin } from '../../../utils/numberFormats';

export const sendAssets = async ({
  transferAmount,
  asset,
  destinationAddress,
  nonce,
  submitProposal,
  t,
}: {
  transferAmount: bigint;
  asset: TokenBalance;
  destinationAddress: string | undefined;
  nonce: number | undefined;
  submitProposal: SubmitProposalFunction;
  t: any;
}) => {
  const isEth =
    !asset.tokenAddress ||
    asset.nativeToken ||
    asset.tokenAddress.toLowerCase() === MOCK_MORALIS_ETH_ADDRESS.toLowerCase();
  const description = formatCoin(transferAmount, false, asset.decimals, asset.symbol);

  let calldatas = ['0x' as Hex];
  let target =
    isEth && destinationAddress ? getAddress(destinationAddress) : getAddress(asset.tokenAddress);
  if (!isEth && destinationAddress && isAddress(destinationAddress)) {
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

  await submitProposal({
    proposalData,
    nonce,
    pendingToastMessage: t('sendAssetsPendingToastMessage'),
    successToastMessage: t('sendAssetsSuccessToastMessage'),
    failedToastMessage: t('sendAssetsFailureToastMessage'),
  });
};
