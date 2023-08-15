import { getSTETHContract, getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';
import { formatCoin } from '../../../utils';
import useSubmitProposal from '../../DAO/proposal/useSubmitProposal';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export default function useLidoStaking() {
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const {
    staking: { lido },
  } = useNetworkConfig();
  const signerOrProvider = useSignerOrProvider();
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation('proposal');

  const handleStake = useCallback(
    async (value: BigNumber) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }

      const stETHContract = getSTETHContract(lido.stETHContractAddress, signerOrProvider);

      const proposalData: ProposalExecuteData = {
        metaData: {
          title: 'Stake ETH with Lido',
          description: `This proposal will result in staking ${formatCoin(
            value,
            true,
            18
          )} ETH to Lido`,
          documentationUrl: '',
        },
        targets: [lido.stETHContractAddress],
        calldatas: [stETHContract.interface.encodeFunctionData('submit', [lido.rewardsAddress])],
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
    [lido, signerOrProvider, daoAddress, safe, submitProposal, t]
  );

  const handleUnstake = useCallback(
    async (value: string) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }
      const stETHContract = getSTETHContract(lido.stETHContractAddress, signerOrProvider);
      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
        signerOrProvider
      );

      const proposalData: ProposalExecuteData = {
        metaData: {
          title: 'Unstake stETH',
          description: `This proposal will result in granting permit for withdrawal contract to use manipulate your stETH and creating withdrawal request for unstaking ${formatCoin(
            value,
            true,
            18
          )} stETH from Lido`,
          documentationUrl: '',
        },
        targets: [lido.stETHContractAddress, lido.withdrawalQueueContractAddress],
        calldatas: [
          stETHContract.interface.encodeFunctionData('approve', [
            lido.withdrawalQueueContractAddress,
            value,
          ]),
          withdrawalQueueContract.interface.encodeFunctionData('requestWithdrawals', [
            [value],
            daoAddress,
          ]),
        ],
        values: ['0', '0'],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t, signerOrProvider]
  );

  const handleClaimUnstakedETH = useCallback(
    async (nftId: BigNumber) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }

      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
        signerOrProvider
      );

      const proposalData: ProposalExecuteData = {
        metaData: {
          title: 'Claim unstaked ETH from stETH',
          description:
            'This proposal will trigger burning NFT that represents your Lido withdrawal request. All the unstaked ETH will be sent to your Safe.',
          documentationUrl: '',
        },
        targets: [lido.withdrawalQueueContractAddress],
        calldatas: [
          withdrawalQueueContract.interface.encodeFunctionData('claimWithdrawal', [nftId]),
        ],
        values: ['0'],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t, signerOrProvider]
  );

  return { handleStake, handleUnstake, handleClaimUnstakedETH };
}
