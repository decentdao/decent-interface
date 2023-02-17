import { ERC20__factory, FractalModule } from '@fractal-framework/fractal-contracts';
import { SafeBalanceResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider } from 'wagmi';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GnosisModuleType, SafeInfoResponseWithGuard } from '../../providers/Fractal/types';
import useSubmitProposal from './proposal/useSubmitProposal';
import useDefaultNonce from './useDefaultNonce';

interface IUseClawBack {
  childSafeAddress: string;
  parentSafeAddress?: string;
}

export default function useClawBack({ childSafeAddress, parentSafeAddress }: IUseClawBack) {
  const [childSafeInfo, setChildSafeInfo] = useState<SafeInfoResponseWithGuard>();
  const [childSafeBalance, setChildSafeBalance] = useState<SafeBalanceResponse[]>([]);

  const { t } = useTranslation('proposal');
  const provider = useProvider();
  const {
    gnosis: { safeService },
    actions: { lookupModules },
  } = useFractal();
  const { submitProposal, canUserCreateProposal } = useSubmitProposal();
  const nonce = useDefaultNonce();
  const abiCoder = new ethers.utils.AbiCoder();

  useEffect(() => {
    const loadData = async () => {
      if (safeService) {
        setChildSafeInfo(await safeService.getSafeInfo(childSafeAddress));
        setChildSafeBalance(await safeService.getBalances(childSafeAddress));
      }
    };

    loadData();
  }, [childSafeAddress, safeService]);

  const handleClawBack = async () => {
    if (canUserCreateProposal && parentSafeAddress && childSafeInfo) {
      const modules = await lookupModules(childSafeInfo.modules);
      const fractalModule = modules!.find(module => module.moduleType === GnosisModuleType.FRACTAL);
      const fractalModuleContract = fractalModule?.moduleContract as FractalModule;
      if (fractalModule) {
        const transactions = childSafeBalance.map(asset => {
          if (!asset.tokenAddress) {
            // Seems like we're operating with native coin i.e ETH
            return {
              target: parentSafeAddress,
              value: asset.balance,
              calldata: '0x',
            };
          } else {
            const tokenContract = ERC20__factory.connect(asset.tokenAddress, provider);
            const clawBackCalldata = tokenContract.interface.encodeFunctionData('transfer', [
              parentSafeAddress,
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
            title: 'Clawback Proposal',
            description: 'This proposal returns all the funds from subDAO to the parentDAO.',
            documentationUrl: '',
            targets: transactions.map(tx => tx.target),
            values: transactions.map(tx => tx.value),
            calldatas: transactions.map(tx => tx.calldata),
          },
          nonce,
          pendingToastMessage: t('clawBackPendingToastMessage'),
          failedToastMessage: t('clawBackFailedToastMessage'),
          successToastMessage: t('clawBackSuccessToastMessage'),
          safeAddress: parentSafeAddress,
        });
      }
    }
  };

  return { handleClawBack };
}
