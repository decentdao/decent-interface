import { SafeBalanceResponse } from '@safe-global/safe-service-client';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isAddress, getAddress, Hex, encodeFunctionData, erc20Abi } from 'viem';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../../types';
import { formatCoin } from '../../../../utils/numberFormats';

const useSendAssets = ({
  transferAmount,
  asset,
  destinationAddress,
  nonce,
}: {
  transferAmount: bigint;
  asset: SafeBalanceResponse;
  destinationAddress: string | undefined;
  nonce: number | undefined;
}) => {
  const { submitProposal } = useSubmitProposal();

  const { t } = useTranslation(['modals', 'proposalMetadata']);

  const sendAssets = useCallback(async () => {
    const isEth = !asset.tokenAddress;
    const description = formatCoin(
      transferAmount,
      false,
      asset?.token?.decimals,
      asset?.token?.symbol,
    );

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
        description: description,
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
  }, [
    asset.tokenAddress,
    asset?.token?.decimals,
    asset?.token?.symbol,
    transferAmount,
    destinationAddress,
    t,
    submitProposal,
    nonce,
  ]);

  return sendAssets;
};

export default useSendAssets;
