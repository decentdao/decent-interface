import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../types';

const useSendAssets = ({
  transferAmount,
  asset,
  destinationAddress,
  nonce,
}: {
  transferAmount: BigNumber;
  asset: SafeBalanceUsdResponse;
  destinationAddress: string;
  nonce: number | undefined;
}) => {
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation('modals');

  const sendAssets = useCallback(() => {
    const isEth = !asset.tokenAddress;
    const description = 'To:' + destinationAddress + ', amount:' + transferAmount.toString();

    const funcSignature = 'function transfer(address to, uint256 value)';
    const calldatas = [
      new ethers.utils.Interface([funcSignature]).encodeFunctionData('transfer', [
        destinationAddress,
        transferAmount,
      ]),
    ];

    const proposalData: ProposalExecuteData = {
      targets: [isEth ? destinationAddress : asset.tokenAddress],
      values: [isEth ? transferAmount : BigNumber.from('0')],
      calldatas: isEth ? ['0x'] : calldatas,
      title: 'Send Assets',
      description: description,
      documentationUrl: '',
    };

    submitProposal({
      proposalData,
      nonce,
      pendingToastMessage: t('sendAssetsPendingToastMessage'),
      successToastMessage: t('sendAssetsSuccessToastMessage'),
      failedToastMessage: t('sendAssetsFailureToastMessage'),
    });
  }, [asset.tokenAddress, destinationAddress, transferAmount, submitProposal, nonce, t]);

  return sendAssets;
};

export default useSendAssets;
