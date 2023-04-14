import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDAOProposals } from '../../../../hooks/DAO/loaders/useProposals';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../../types';
import { formatCoin } from '../../../../utils/numberFormats';

const useSendAssets = ({
  transferAmount,
  asset,
  destinationAddress,
  nonce,
  daoAddress,
}: {
  transferAmount: BigNumber;
  asset: SafeBalanceUsdResponse;
  destinationAddress: string;
  nonce: number | undefined;
  daoAddress: string | null;
}) => {
  const { submitProposal } = useSubmitProposal();

  const { t } = useTranslation(['modals', 'proposalMetadata']);
  const loadDAOProposals = useDAOProposals();
  const sendAssets = useCallback(async () => {
    const isEth = !asset.tokenAddress;
    const description = formatCoin(
      transferAmount,
      false,
      asset?.token?.decimals,
      asset?.token?.symbol
    );

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
      title: t(isEth ? 'Send Eth' : 'Send Token', { ns: 'proposalMetadata' }),
      description: description,
      documentationUrl: '',
    };

    await submitProposal({
      proposalData,
      successCallback: () => {
        loadDAOProposals();
      },
      nonce,
      pendingToastMessage: t('sendAssetsPendingToastMessage'),
      successToastMessage: t('sendAssetsSuccessToastMessage'),
      failedToastMessage: t('sendAssetsFailureToastMessage'),
      safeAddress: daoAddress!,
    });
  }, [
    asset.tokenAddress,
    asset?.token?.decimals,
    asset?.token?.symbol,
    transferAmount,
    destinationAddress,
    daoAddress,
    loadDAOProposals,
    t,
    submitProposal,
    nonce,
  ]);

  return sendAssets;
};

export default useSendAssets;
