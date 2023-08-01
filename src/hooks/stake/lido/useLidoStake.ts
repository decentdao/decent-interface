import { getSTETHContract } from '@lido-sdk/contracts';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';
import useSubmitProposal from '../../DAO/proposal/useSubmitProposal';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export default function useLidoStake() {
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
      stETHContract.functions.submit(lido.rewardsAddress);

      const proposalData: ProposalExecuteData = {
        title: 'Stake ETH',
        description: `This proposal will result in staking ${value} ETH to Lido`,
        documentationUrl: '',
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

  return { handleStake };
}
