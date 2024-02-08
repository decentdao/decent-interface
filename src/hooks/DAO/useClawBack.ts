import { ERC20__factory, FractalModule } from '@fractal-framework/fractal-contracts';
import { ethers, utils } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { FractalModuleType, FractalNode } from '../../types';
import { useEthersProvider } from '../utils/useEthersProvider';
import useSubmitProposal from './proposal/useSubmitProposal';

interface IUseClawBack {
  childSafeInfo?: FractalNode;
  parentAddress?: string | null;
}

export default function useClawBack({ childSafeInfo, parentAddress }: IUseClawBack) {
  const { t } = useTranslation(['proposal', 'proposalMetadata']);
  const provider = useEthersProvider();
  const safeAPI = useSafeAPI();
  const { submitProposal, canUserCreateProposal } = useSubmitProposal();

  const handleClawBack = useCallback(async () => {
    if (childSafeInfo && childSafeInfo.daoAddress && parentAddress) {
      const childSafeBalance = await safeAPI.getBalances(
        utils.getAddress(childSafeInfo.daoAddress)
      );
      const parentSafeInfo = await safeAPI.getSafeInfo(utils.getAddress(parentAddress));
      if (canUserCreateProposal && parentAddress && childSafeInfo && parentSafeInfo) {
        const abiCoder = new ethers.utils.AbiCoder();
        const fractalModule = childSafeInfo.fractalModules!.find(
          module => module.moduleType === FractalModuleType.FRACTAL
        );
        const fractalModuleContract = fractalModule?.moduleContract as FractalModule;
        if (fractalModule) {
          const transactions = childSafeBalance.map(asset => {
            if (!asset.tokenAddress) {
              // Seems like we're operating with native coin i.e ETH
              const txData = abiCoder.encode(
                ['address', 'uint256', 'bytes', 'uint8'],
                [parentAddress, asset.balance, '0x', 0]
              );
              const fractalModuleCalldata = fractalModuleContract.interface.encodeFunctionData(
                'execTx',
                [txData]
              );
              return {
                target: fractalModuleContract.address,
                value: 0,
                calldata: fractalModuleCalldata,
              };
            } else {
              const tokenContract = ERC20__factory.connect(asset.tokenAddress, provider);
              const clawBackCalldata = tokenContract.interface.encodeFunctionData('transfer', [
                parentAddress,
                asset.balance,
              ]);
              const txData = abiCoder.encode(
                ['address', 'uint256', 'bytes', 'uint8'],
                [asset.tokenAddress, 0, clawBackCalldata, 0]
              );
              const fractalModuleCalldata = fractalModuleContract.interface.encodeFunctionData(
                'execTx',
                [txData]
              );

              return {
                target: fractalModuleContract.address,
                value: 0,
                calldata: fractalModuleCalldata,
              };
            }
          });

          submitProposal({
            proposalData: {
              metaData: {
                title: t('Clawback Proposal', { ns: 'proposalMetadata' }),
                description: t(
                  'Transfer all funds from the targeted sub-Safe to the parent-Safe treasury.',
                  {
                    ns: 'proposalMetadata',
                  }
                ),
                documentationUrl: '',
              },
              targets: transactions.map(tx => tx.target),
              values: transactions.map(tx => tx.value),
              calldatas: transactions.map(tx => tx.calldata),
            },
            nonce: parentSafeInfo.nonce,
            pendingToastMessage: t('clawBackPendingToastMessage'),
            failedToastMessage: t('clawBackFailedToastMessage'),
            successToastMessage: t('clawBackSuccessToastMessage'),
            safeAddress: parentAddress,
          });
        }
      }
    }
  }, [canUserCreateProposal, childSafeInfo, parentAddress, provider, submitProposal, t, safeAPI]);

  return { handleClawBack };
}
