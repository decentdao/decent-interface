import { getSTETHContract, getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isHex, getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';
import useSubmitProposal from '../../DAO/proposal/useSubmitProposal';

export default function useLidoStaking() {
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const {
    staking: { lido },
  } = useNetworkConfig();
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation('proposal');

  const handleStake = useCallback(
    async (value: bigint) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }

      const stETHContract = getSTETHContract(lido.stETHContractAddress);

      const encodedSubmit = stETHContract.interface.encodeFunctionData('submit', [
        lido.rewardsAddress,
      ]);
      if (!isHex(encodedSubmit)) {
        return;
      }
      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('Stake ETH with Lido'),
          description: t('This proposal will stake ETH in Lido, returning stETH to your treasury.'),
          documentationUrl: 'https://docs.lido.fi/guides/steth-integration-guide#what-is-steth',
        },
        targets: [getAddress(lido.stETHContractAddress)],
        calldatas: [encodedSubmit],
        values: [value],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t],
  );

  const handleUnstake = useCallback(
    async (value: string) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }
      const stETHContract = getSTETHContract(lido.stETHContractAddress);
      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
      );

      const encodedApprove = stETHContract.interface.encodeFunctionData('approve', [
        lido.withdrawalQueueContractAddress,
        value,
      ]);

      if (!isHex(encodedApprove)) {
        return;
      }

      const encodedWithdraw = withdrawalQueueContract.interface.encodeFunctionData(
        'requestWithdrawals',
        [[value], daoAddress],
      );
      if (!isHex(encodedWithdraw)) {
        return;
      }
      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('Unstake stETH'),
          description: t(
            'This proposal will unstake your stETH from Lido and mint a Lido Withdrawal NFT which can be used to claim your ETH.',
          ),
          documentationUrl:
            'https://docs.lido.fi/guides/steth-integration-guide#request-withdrawal-and-mint-nft',
        },
        targets: [
          getAddress(lido.stETHContractAddress),
          getAddress(lido.withdrawalQueueContractAddress),
        ],
        calldatas: [encodedApprove, encodedWithdraw],
        values: [0n, 0n],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t],
  );

  const handleClaimUnstakedETH = useCallback(
    async (nftId: bigint) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }

      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
      );

      const encodedClaim = withdrawalQueueContract.interface.encodeFunctionData('claimWithdrawal', [
        nftId,
      ]);
      if (!isHex(encodedClaim)) {
        return;
      }
      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('Lido Withdrawal'),
          description: t(
            'This proposal will burn your Lido Withdrawal NFT and return the ETH to your Safe.',
          ),
          documentationUrl: 'https://docs.lido.fi/guides/steth-integration-guide#claiming',
        },
        targets: [getAddress(lido.withdrawalQueueContractAddress)],
        calldatas: [encodedClaim],
        values: [0n],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t],
  );

  return { handleStake, handleUnstake, handleClaimUnstakedETH };
}
