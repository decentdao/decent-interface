import { getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { useState, useEffect } from 'react';
import useLidoStaking from '../../../../hooks/stake/lido/useLidoStaking';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import useSignerOrProvider from '../../../../hooks/utils/useSignerOrProvider';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ModalType } from '../../../ui/modals/ModalProvider';
import { useFractalModal } from '../../../ui/modals/useFractalModal';

export default function useTreasuryLidoInteractions() {
  const {
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();
  const ethAsset = assetsFungible.find(asset => !asset.tokenAddress);
  const { handleUnstake, handleClaimUnstakedETH } = useLidoStaking();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { staking } = useNetworkConfig();
  // --- Lido Stake button setup ---
  const showStakeButton =
    canUserCreateProposal &&
    Object.keys(staking).length > 0 &&
    ethAsset &&
    BigInt(ethAsset.balance) > 0n;
  const openStakingModal = useFractalModal(ModalType.STAKE);

  // --- Lido Unstake button setup ---
  const stETHAsset = assetsFungible.find(
    asset => asset.tokenAddress === staking?.lido?.stETHContractAddress,
  );
  const showUnstakeButton = canUserCreateProposal && staking.lido && stETHAsset;
  const handleUnstakeButtonClick = () => {
    if (stETHAsset) {
      handleUnstake(stETHAsset.balance);
    }
  };

  // --- Lido Claim ETH button setup ---
  const signerOrProvider = useSignerOrProvider();
  const [isLidoClaimable, setIsLidoClaimable] = useState(false);
  const lidoWithdrawelNFT = assetsNonFungible.find(
    asset => asset.tokenAddress === staking.lido?.withdrawalQueueContractAddress,
  );
  const showClaimETHButton = canUserCreateProposal && staking.lido && lidoWithdrawelNFT;
  useEffect(() => {
    const getLidoClaimableStatus = async () => {
      if (
        !staking.lido?.withdrawalQueueContractAddress ||
        !lidoWithdrawelNFT ||
        !signerOrProvider
      ) {
        return;
      }
      const withdrawalQueueContract = getWithdrawalQueueContract(
        staking.lido.withdrawalQueueContractAddress,
        signerOrProvider,
      );
      const claimableStatus = (
        await withdrawalQueueContract.getWithdrawalStatus([lidoWithdrawelNFT!.tokenId])
      )[0]; // Since we're checking for the single NFT - we can grab first array element
      if (claimableStatus.isFinalized !== isLidoClaimable) {
        setIsLidoClaimable(claimableStatus.isFinalized);
      }
    };

    getLidoClaimableStatus();
  }, [staking, isLidoClaimable, signerOrProvider, lidoWithdrawelNFT]);
  const handleClickClaimButton = () => {
    handleClaimUnstakedETH(BigInt(lidoWithdrawelNFT!.tokenId));
  };

  return {
    handleClickClaimButton,
    showClaimETHButton,
    showUnstakeButton,
    handleUnstakeButtonClick,
    showStakeButton,
    openStakingModal,
    isLidoClaimable,
  };
}
